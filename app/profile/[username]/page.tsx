import PublicAuthorProfile from "@/components/PublicAuthorProfile";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function AuthorProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <PublicAuthorProfile username={username} />;
}
