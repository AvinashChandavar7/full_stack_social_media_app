import React, { useState, useEffect } from "react";
import { Models } from "appwrite"
import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queriesAndMutations";
import { checkIsLiked } from "@/lib/utils";
import Loader from "./Loader";

type PostStatsProps = {
  post?: Models.Document;
  userId: string;
}

const PostStats = ({ post, userId }: PostStatsProps) => {

  const likesList = post?.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false)

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSaved } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savePostRecord = currentUser?.save.find(
    (record: Models.Document) => record.post.$id === post?.$id
  );


  const handleLikePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();

    let newLikes = [...likes];

    const hasLiked = newLikes.includes(userId);

    if (hasLiked) {
      newLikes = newLikes.filter((id) => id !== userId)
    } else {
      newLikes.push(userId);
    }

    setLikes(newLikes);
    likePost({ postId: post?.$id || "", likesArray: newLikes });
  };


  const handleSavePost = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();


    if (savePostRecord) {
      setIsSaved(false);
      deleteSavedPost(savePostRecord.$id);
    } else {
      savePost({ postId: post?.$id || "", userId });
      setIsSaved(true);
    }

  };

  useEffect(() => {
    setIsSaved(!!savePostRecord)
  }, [currentUser, savePostRecord]);

  return (
    <div className="flex justify-between items-center z-20">

      <div className="flex gap-2 mr-5">
        <img src={
          checkIsLiked(likes, userId)
            ? " /public/assets/icons/liked.svg"
            : " /public/assets/icons/like.svg"
        }
          alt="like" width={20} height={20}
          className="cursor-pointer"
          onClick={handleLikePost}
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2 ">
        {isSavingPost || isDeletingSaved ? (<Loader />) : (
          <img src={
            isSaved
              ? "/public/assets/icons/saved.svg"
              : "/public/assets/icons/save.svg"
          }
            alt="save" width={20} height={20}
            className="cursor-pointer"
            onClick={(e) => handleSavePost(e)}
          />)}
      </div>



    </div>
  )
}

export default PostStats