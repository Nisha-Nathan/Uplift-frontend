import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface PostOptions {
  backgroundColor?: string;
}

export interface PostDoc extends BaseDoc {
  author: ObjectId;
  content: string;
  options?: PostOptions;
}

export interface JournalDoc extends PostDoc {
  title: string;
}

/**
 * concept: Posting [Author]
 */
export default class PostingConcept {
  public readonly posts: DocCollection<PostDoc>;
  private readonly journals: DocCollection<JournalDoc>;

  /**
   * Make an instance of Posting.
   */
  constructor(collectionName: string) {
    this.posts = new DocCollection<PostDoc>(collectionName);
    this.journals = new DocCollection<JournalDoc>(collectionName + "_journal");
  }

  async create(author: ObjectId, content: string, postType: "public" | "private", options?: PostOptions, title?: string) {
    if (postType === "public") {
      const _id = await this.posts.createOne({ author, content, options });
      return { msg: "Post successfully created!", post: await this.posts.readOne({ _id }) };
    } else {
      const _id = await this.journals.createOne({ title, author, content, options });
      return { msg: "Journal successfully created!", journal: await this.journals.readOne({ _id }) };
    }
  }

  async getPosts() {
    // Returns all posts! You might want to page for better client performance
    return await this.posts.readMany({}, { sort: { _id: -1 } });
  }

  async getByAuthor(author: ObjectId, postType: "public" | "private") {
    if (postType === "public") {
      return await this.posts.readMany({ author }, { sort: { _id: -1 } });
    } else {
      return await this.journals.readMany({ author }, { sort: { _id: -1 } });
    }
  }

  async update(_id: ObjectId, postType: "public" | "private", content?: string, options?: PostOptions, title?: string) {
    // Note that if content or options is undefined, those fields will *not* be updated
    // since undefined values for partialUpdateOne are ignored.
    if (postType === "public") {
      await this.posts.partialUpdateOne({ _id }, { content, options });
      return { msg: "Post successfully updated!" };
    } else {
      await this.journals.partialUpdateOne({ _id }, { title, content, options });
      return { msg: "Journal successfully updated!" };
    }
  }

  async delete(_id: ObjectId, postType: "public" | "private") {
    if (postType === "public") {
      await this.posts.deleteOne({ _id });
      return { msg: "Post deleted successfully!" };
    } else {
      await this.journals.deleteOne({ _id });
      return { msg: "Journal deleted successfully!" };
    }
  }

  async assertAuthorIsUser(_id: ObjectId, postType: "public" | "private", user: ObjectId) {
    let post;
    if (postType === "public") {
      post = await this.posts.readOne({ _id });
    } else {
      post = await this.journals.readOne({ _id });
    }
    if (!post) {
      throw new NotFoundError(`Post ${_id} does not exist!`);
    }
    if (post.author.toString() !== user.toString()) {
      throw new PostAuthorNotMatchError(user, _id);
    }
  }

  async getPostContent(_id: ObjectId) {
    const post = await this.posts.readOne({ _id });
    return post?.content;
  }

  async getJournalEntry(_id: ObjectId, user: ObjectId) {
    const journal = await this.journals.readOne({ _id,author: user });
    return journal;
  }
}

export class PostAuthorNotMatchError extends NotAllowedError {
  constructor(
    public readonly author: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", author, _id);
  }
}
