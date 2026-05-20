import { BlogPostEditorPage } from "@/components/blog/BlogPostEditorPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  return <BlogPostEditorPage postId={id} section="blog" />;
}
