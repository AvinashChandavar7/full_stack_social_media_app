import * as z from "zod"
import { Models } from "appwrite"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"

import { useToast } from "../ui/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"

import FileUploader from "../shared/FileUploader";

import { PostValidation } from "@/lib/validation";

import { useUserContext } from "@/context/AuthContext";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations"
import Loader from "../shared/Loader"




type PostFromProps = {
  post?: Models.Document;
  action: "Create" | "Update";
}


const PostForm = ({ post, action }: PostFromProps) => {

  const navigate = useNavigate();

  const { mutateAsync: createPost,
    isPending: isLoadingCreate
  } = useCreatePost();

  const { mutateAsync: updatePost,
    isPending: isLoadingUpdate
  } = useUpdatePost();



  const { user } = useUserContext();
  const { toast } = useToast();

  // 1. Define your form.
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post?.tags.join(',') : "",
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    // console.log(values)

    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        imageId: post?.imageId,
        imageUrl: post?.imageUrl
      });

      if (!updatedPost) {
        toast({ title: "Something went wrong , please try again" })
      }

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost(
      { ...values, userId: user.id }
    );

    if (!newPost) {
      toast({ title: "Something went wrong , please try again" })
    }

    navigate("/");
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">

        {/* Caption */}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" placeholder="Caption" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message text-red-500" />
            </FormItem>
          )}
        />

        {/* File Uploader */}
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message text-red-500" />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" placeholder="location" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message text-red-500" />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" placeholder="Add Tags like JS, React ,NextJs" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message text-red-500" />
            </FormItem>
          )}
        />


        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_dark_4">Cancel</Button>

          <Button type="submit"
            className="shad-button_primary whitespace-nowrap "
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {isLoadingCreate || isLoadingUpdate && <Loader />}
            {action} Post
          </Button>
        </div>


      </form>
    </Form>
  )
}

export default PostForm