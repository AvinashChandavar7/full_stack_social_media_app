import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

import { ID, Query } from "appwrite";


export async function createUserAccount(user: INewUser) {
  try {
    // const newAccount = await account.create(ID.unique(), user.email, user.password, user.name, )

    const { email, password, name } = user;

    const newAccount = await account.create(
      ID.unique(), email, password, name,
    );

    if (!newAccount) {
      throw new Error;
    }

    const avatarUrl = avatars.getInitials(name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDB(user: {
  accountId: string,
  email: string,
  name: string,
  imageUrl: URL,
  username?: string,
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    )

    return newUser

  } catch (error) {
    console.log(error);
  }

}

export async function signInAccount(user: { email: string, password: string }) {
  try {
    const session = await account.createEmailSession(
      user.email, user.password
    );
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      throw new Error;
    }

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) {
      throw new Error;
    }

    return currentUser.documents[0];

  } catch (error) {
    console.log(error);
  }
}

/*Post */

export async function createPost(post: INewPost) {
  try {
    // Upload image to Storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) {
      throw new Error;
    }

    const fileUrl = geFilePreview(uploadedFile.$id)

    if (!fileUrl) {
      deleteFile(uploadedFile.$id);
      throw new Error;
    }

    // Convert tags in an array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    // Save post to database
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags
      }
    )

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;
  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId
    }

    if (hasFileToUpdate) {

      // Upload image to Storage
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) {
        throw new Error;
      }

      const fileUrl = geFilePreview(uploadedFile.$id)

      if (!fileUrl) {
        deleteFile(uploadedFile.$id);
        throw new Error;
      }

      image = {
        ...image,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id
      };
    }



    // Convert tags in an array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    // Save post to database
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags
      }
    )

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw new Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) {
    throw new Error;
  }

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return { status: "ok" }
  } catch (error) {
    console.log(error);
  }

}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    );

    if (!posts) {
      throw new Error;
    }

    return posts;

  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    return post;

  } catch (error) {
    console.log(error);
  }
}

/* */
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;

  } catch (error) {
    console.log(error);
  }
}
export function geFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,  // width=2000
      2000,  // height=2000
      "top", // gravity=top
      100,   // quality=100
    );

    return fileUrl;

  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId)
    return { status: "ok" }
  } catch (error) {
    console.log(error);
  }
}

/*Like ,Save ,Delete */
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { likes: likesArray }
    );

    if (!updatedPost) {
      throw new Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      { user: userId, post: postId, }
    );

    if (!updatedPost) {
      throw new Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) {
      throw new Error;
    }

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

/*  */

export async function getInfinitePosts({ pageParmas }: { pageParmas: number }) {
  const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]

  if (pageParmas) {
    queries.push(Query.cursorAfter(pageParmas.toString()));
  }
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) {
      throw new Error;
    }

    return posts;

  } catch (error) {
    console.log(error);
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    );

    if (!posts) {
      throw new Error;
    }

    return posts;

  } catch (error) {
    console.log(error);
  }
}