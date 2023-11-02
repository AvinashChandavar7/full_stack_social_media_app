import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { formatDateString } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { data: post, isPending } = useGetPostById(id || "");

  const handleDeletePost = () => { }


  return (
    <div className="post_details-container">
      {isPending ? <Loader /> : (
        <div className="post_details-card">

          <img className='post_details-img' alt="post"
            src={post?.imageUrl}
            loading="lazy"
          />


          <div className="post_details-info">
            <div className="flex-between w-full">

              <Link to={`/profile/${post?.creator.$id}`} className="flex items-center gap-3">
                <img className='rounded-full h-10 w-10 lg:w-12 lg:h-12' alt="creator"
                  src={post?.creator?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                />


                <div className="flex flex-col">
                  <p>{post?.creator?.name}</p>

                  <div className="flex-center gap-2 text-light-3" >
                    <p className="subtle-semibold lg:small-regular">
                      {formatDateString(post?.$createdAt as string)}
                    </p>
                    -
                    <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                  </div>
                </div>
              </Link>


              <div className="flex-center ">

                <Link to={`/update-post/${post?.$id}`} className={`${user?.id !== post?.creator.$id && "hidden"}`}>
                  <img src="/assets/icons/edit.svg" alt="edit" width={24} height={24} />
                </Link>

                <Button className={`ghost_details-delete_btn ${user?.id !== post?.creator.$id && "hidden"}`}
                  onClick={handleDeletePost} variant="ghost"
                >
                  <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
                </Button>
              </div>
            </div>

            <hr className="border w-full border-dark-4" />

            <div className="small-medium lg:base-medium flex flex-col flex-1 w-full ">
              <p>{post?.caption}</p>

              <ul className="flex gap-1 mt-2 pb-4">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3 capitalize">#{tag}</li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>

          </div>
        </div>
      )
      }
    </div >
  );
}

export default PostDetails;
