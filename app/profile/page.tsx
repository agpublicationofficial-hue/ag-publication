"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Author = {
  id: string;
  full_name: string;
  email: string;
  role?: string | null;
};

type Profile = {
  author_id: string;
  username: string;
  alternate_email: string;
  alternate_phone: string;
  about_short: string;
  about: string;
  website: string;
  newsletter_enabled: boolean;
  show_email: boolean;
  profile_image_url: string;
};

type SocialLink = {
  id?: string;
  platform: string;
  url: string;
};

type CustomLink = {
  id?: string;
  link_name: string;
  url: string;
};

type ExternalBook = {
  id?: string;
  title: string;
  author_name: string;
  amazon_url: string;
  flipkart_url: string;
  google_books_url: string;
  kindle_url: string;
  other_url: string;
};

type Service = {
  id?: string;
  service_name: string;
  price: string;
  description: string;
};

const emptyProfile: Profile = {
  author_id: "",
  username: "",
  alternate_email: "",
  alternate_phone: "",
  about_short: "",
  about: "",
  website: "",
  newsletter_enabled: false,
  show_email: false,
  profile_image_url: "",
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [author, setAuthor] = useState<Author | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [externalBooks, setExternalBooks] = useState<ExternalBook[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [usernameMessage, setUsernameMessage] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.push("/author-login");
      return;
    }

    const userId = session.user.id;

    const { data: authorData, error: authorError } = await supabase
      .from("authors")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .maybeSingle();

    if (authorError) {
      console.error(authorError);
      setMessage(authorError.message);
      setLoading(false);
      return;
    }

    if (!authorData) {
      setMessage("Author account not found.");
      setLoading(false);
      return;
    }

    setAuthor(authorData);

    const { data: profileData } = await supabase
      .from("author_profiles")
      .select("*")
      .eq("author_id", userId)
      .maybeSingle();

    if (profileData) {
      setProfile({
        ...emptyProfile,
        ...profileData,
        author_id: userId,
      });
    } else {
      setProfile({
        ...emptyProfile,
        author_id: userId,
      });
    }

    const { data: socialData } = await supabase
      .from("author_social_links")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: true });

    setSocialLinks(
      (socialData || []).map((item) => ({
        id: item.id,
        platform: item.platform || "",
        url: item.url || "",
      }))
    );

    const { data: customData } = await supabase
      .from("author_custom_links")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: true });

    setCustomLinks(
      (customData || []).map((item) => ({
        id: item.id,
        link_name: item.link_name || "",
        url: item.url || "",
      }))
    );

    const { data: booksData } = await supabase
      .from("author_external_books")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: true });

    setExternalBooks(
      (booksData || []).map((item) => ({
        id: item.id,
        title: item.title || "",
        author_name: item.author_name || "",
        amazon_url: item.amazon_url || "",
        flipkart_url: item.flipkart_url || "",
        google_books_url: item.google_books_url || "",
        kindle_url: item.kindle_url || "",
        other_url: item.other_url || "",
      }))
    );

    const { data: servicesData } = await supabase
      .from("author_services")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: true });

    setServices(
      (servicesData || []).map((item) => ({
        id: item.id,
        service_name: item.service_name || "",
        price:
          item.price !== null && item.price !== undefined
            ? String(item.price)
            : "",
        description: item.description || "",
      }))
    );

    setLoading(false);
  }

  function updateProfile(field: keyof Profile, value: string | boolean) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addSocialLink() {
    setSocialLinks((current) => [
      ...current,
      {
        platform: "",
        url: "",
      },
    ]);
  }

  function updateSocialLink(
    index: number,
    field: keyof SocialLink,
    value: string
  ) {
    setSocialLinks((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeSocialLink(index: number) {
    setSocialLinks((current) => current.filter((_, i) => i !== index));
  }

  function addCustomLink() {
    setCustomLinks((current) => [
      ...current,
      {
        link_name: "",
        url: "",
      },
    ]);
  }

  function updateCustomLink(
    index: number,
    field: keyof CustomLink,
    value: string
  ) {
    setCustomLinks((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeCustomLink(index: number) {
    setCustomLinks((current) => current.filter((_, i) => i !== index));
  }

  function addExternalBook() {
    setExternalBooks((current) => [
      ...current,
      {
        title: "",
        author_name: author?.full_name || "",
        amazon_url: "",
        flipkart_url: "",
        google_books_url: "",
        kindle_url: "",
        other_url: "",
      },
    ]);
  }

  function updateExternalBook(
    index: number,
    field: keyof ExternalBook,
    value: string
  ) {
    setExternalBooks((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeExternalBook(index: number) {
    setExternalBooks((current) => current.filter((_, i) => i !== index));
  }

  function addService() {
    setServices((current) => [
      ...current,
      {
        service_name: "",
        price: "",
        description: "",
      },
    ]);
  }

  function updateService(
    index: number,
    field: keyof Service,
    value: string
  ) {
    setServices((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function removeService(index: number) {
    setServices((current) => current.filter((_, i) => i !== index));
  }

  async function checkUsername() {
    const username = profile.username.trim().toLowerCase();

    setUsernameMessage("");
    setUsernameAvailable(null);

    if (!username) {
      setUsernameMessage("Please enter a username.");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setUsernameMessage(
        "Use 3-30 characters: lowercase letters, numbers and underscore only."
      );
      return;
    }

    const { data, error } = await supabase.rpc(
      "check_author_username",
      {
        requested_username: username,
      }
    );

    if (error) {
      console.error(error);
      setUsernameMessage("Username check failed.");
      return;
    }

    if (data === true) {
      setUsernameAvailable(true);
      setUsernameMessage("✓ Username is available.");
    } else {
      setUsernameAvailable(false);
      setUsernameMessage("✕ Username is already taken.");
    }
  }

  async function saveProfile() {
    if (!author) return;

    setSaving(true);
    setMessage("");

    const username = profile.username.trim().toLowerCase();

    if (
      username &&
      !/^[a-z0-9_]{3,30}$/.test(username)
    ) {
      setMessage(
        "Username must contain 3-30 lowercase letters, numbers or underscore."
      );
      setSaving(false);
      return;
    }

    if (username) {
      const { data, error } = await supabase.rpc(
        "check_author_username",
        {
          requested_username: username,
        }
      );

      if (error) {
        console.error(error);
        setMessage("Unable to verify username.");
        setSaving(false);
        return;
      }

      if (!data) {
        setMessage("This username is already taken.");
        setSaving(false);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("author_profiles")
      .upsert(
        {
          author_id: author.id,
          username: username || null,
          alternate_email:
            profile.alternate_email.trim() || null,
          alternate_phone:
            profile.alternate_phone.trim() || null,
          about_short:
            profile.about_short.trim() || null,
          about: profile.about.trim() || null,
          website: profile.website.trim() || null,
          newsletter_enabled:
            profile.newsletter_enabled,
          show_email: profile.show_email,
          profile_image_url:
            profile.profile_image_url.trim() || null,
        },
        {
          onConflict: "author_id",
        }
      );

    if (profileError) {
      console.error(profileError);
      setMessage(
        `Profile save failed: ${profileError.message}`
      );
      setSaving(false);
      return;
    }

    await supabase
      .from("author_social_links")
      .delete()
      .eq("author_id", author.id);

    const validSocialLinks = socialLinks
      .map((item) => ({
        author_id: author.id,
        platform: item.platform.trim(),
        url: item.url.trim(),
      }))
      .filter((item) => item.platform && item.url);

    if (validSocialLinks.length > 0) {
      const { error } = await supabase
        .from("author_social_links")
        .insert(validSocialLinks);

      if (error) {
        setMessage(
          `Social links save failed: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    await supabase
      .from("author_custom_links")
      .delete()
      .eq("author_id", author.id);

    const validCustomLinks = customLinks
      .map((item) => ({
        author_id: author.id,
        link_name: item.link_name.trim(),
        url: item.url.trim(),
      }))
      .filter((item) => item.link_name && item.url);

    if (validCustomLinks.length > 0) {
      const { error } = await supabase
        .from("author_custom_links")
        .insert(validCustomLinks);

      if (error) {
        setMessage(
          `Custom links save failed: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    await supabase
      .from("author_external_books")
      .delete()
      .eq("author_id", author.id);

    const validBooks = externalBooks
      .map((book) => ({
        author_id: author.id,
        title: book.title.trim(),
        author_name:
          book.author_name.trim() || null,
        amazon_url:
          book.amazon_url.trim() || null,
        flipkart_url:
          book.flipkart_url.trim() || null,
        google_books_url:
          book.google_books_url.trim() || null,
        kindle_url:
          book.kindle_url.trim() || null,
        other_url:
          book.other_url.trim() || null,
      }))
      .filter((book) => book.title);

    if (validBooks.length > 0) {
      const { error } = await supabase
        .from("author_external_books")
        .insert(validBooks);

      if (error) {
        setMessage(
          `Books save failed: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    await supabase
      .from("author_services")
      .delete()
      .eq("author_id", author.id);

    const validServices = services
      .map((service) => ({
        author_id: author.id,
        service_name:
          service.service_name.trim(),
        price: service.price.trim()
          ? Number(service.price)
          : null,
        description:
          service.description.trim() || null,
      }))
      .filter(
        (service) =>
          service.service_name &&
          (
            service.price === null ||
            Number.isFinite(service.price)
          )
      );

    if (validServices.length > 0) {
      const { error } = await supabase
        .from("author_services")
        .insert(validServices);

      if (error) {
        setMessage(
          `Services save failed: ${error.message}`
        );
        setSaving(false);
        return;
      }
    }

    setProfile((current) => ({
      ...current,
      username,
    }));

    setUsernameAvailable(username ? true : null);
    setMessage("✓ Public profile saved successfully.");
    setSaving(false);
  }

  async function copyProfileLink() {
    if (!profile.username) {
      setMessage("First add and save a username.");
      return;
    }

    const url = `${window.location.origin}/author/${profile.username}`;

    try {
      await navigator.clipboard.writeText(url);
      setMessage("✓ Public profile link copied.");
    } catch {
      setMessage("Unable to copy profile link.");
    }
  }

  function viewPublicProfile() {
    if (!profile.username) {
      setMessage("First add and save a username.");
      return;
    }

    router.push(`/author/${profile.username}`);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/author-login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold">
            Profile unavailable
          </h1>

          <p className="text-gray-500 mt-2">
            {message || "Author account not found."}
          </p>

          <Link
            href="/author-dashboard"
            className="inline-block mt-6 bg-black text-white px-5 py-3 rounded-xl"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-gray-900">
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-[#111318] text-white flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <Link
            href="/"
            className="block w-fit"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </Link>

          <p className="text-xs text-gray-500 mt-2">
            Author Panel
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink
            href="/author-dashboard"
            icon="⌂"
            text="Dashboard"
          />

          <NavLink
            href="/my-books"
            icon="▣"
            text="My Books"
          />

          <NavLink
            href="/publishing-progress"
            icon="◷"
            text="Certificates"
          />

          <NavLink
            href="/support"
            icon="?"
            text="Queries"
          />

          <NavLink
            href="/orders"
            icon="□"
            text="My Orders"
          />

          <NavLink
            href="/royalties"
            icon="₹"
            text="Royalties"
          />

          <NavLink
            href="/author-dashboard"
            icon="▥"
            text="Daily Sales"
          />

          <NavLink
            href="/profile"
            icon="◉"
            text="Profile"
            active
          />

          <NavLink
            href="/settings"
            icon="⚙"
            text="Settings"
          />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/10 hover:text-red-300"
          >
            ↪ &nbsp; Log Out
          </button>
        </div>
      </aside>

      <main className="lg:ml-[260px]">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Author Account
              </p>

              <h1 className="text-2xl font-bold">
                Public Profile
              </h1>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl border ${
                message.startsWith("✓")
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <Section
            title="Basic Information"
            description="Your basic author account information."
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Input
                label="Your Name"
                value={author.full_name}
                disabled
              />

              <Input
                label="Email"
                value={author.email}
                disabled
              />

              <Input
                label="Alternate Email"
                value={profile.alternate_email}
                onChange={(value) =>
                  updateProfile(
                    "alternate_email",
                    value
                  )
                }
                placeholder="alternate@email.com"
              />

              <Input
                label="Alternate Phone"
                value={profile.alternate_phone}
                onChange={(value) =>
                  updateProfile(
                    "alternate_phone",
                    value
                  )
                }
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </Section>

          <Section
            title="Username"
            description="Create your unique public author URL."
          >
            <label className="text-sm font-semibold">
              Username
            </label>

            <div className="mt-2 flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex border rounded-xl overflow-hidden">
                <span className="bg-gray-50 px-4 py-3 text-gray-500 border-r">
                  /author/
                </span>

                <input
                  value={profile.username}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(
                        /[^a-z0-9_]/g,
                        ""
                      );

                    updateProfile(
                      "username",
                      value
                    );

                    setUsernameAvailable(null);
                    setUsernameMessage("");
                  }}
                  placeholder="yourname"
                  className="flex-1 px-4 py-3 outline-none"
                />
              </div>

              <button
                onClick={checkUsername}
                className="px-5 py-3 border rounded-xl font-semibold hover:bg-gray-50"
              >
                Check Availability
              </button>
            </div>

            {usernameMessage && (
              <p
                className={`mt-2 text-sm ${
                  usernameAvailable
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {usernameMessage}
              </p>
            )}

            {profile.username && (
              <div className="mt-4 flex flex-col md:flex-row gap-3">
                <div className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm break-all">
                  {window.location.origin}
                  /author/
                  {profile.username}
                </div>

                <button
                  onClick={copyProfileLink}
                  className="px-5 py-3 border rounded-xl font-semibold"
                >
                  Copy
                </button>

                <button
                  onClick={viewPublicProfile}
                  className="px-5 py-3 bg-black text-white rounded-xl font-semibold"
                >
                  View Page
                </button>
              </div>
            )}
          </Section>

          <Section
            title="About You"
            description="Tell readers about yourself."
          >
            <Input
              label="Short Introduction"
              value={profile.about_short}
              onChange={(value) =>
                updateProfile(
                  "about_short",
                  value
                )
              }
              placeholder="Author, writer, storyteller..."
            />

            <div className="mt-5">
              <label className="text-sm font-semibold">
                About
              </label>

              <textarea
                value={profile.about}
                onChange={(e) =>
                  updateProfile(
                    "about",
                    e.target.value
                  )
                }
                rows={6}
                placeholder="Tell readers about yourself..."
                className="w-full mt-2 border rounded-xl px-4 py-3 outline-none resize-y focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="mt-5">
              <Input
                label="Website"
                value={profile.website}
                onChange={(value) =>
                  updateProfile(
                    "website",
                    value
                  )
                }
                placeholder="https://yourwebsite.com"
              />
            </div>
          </Section>

          <Section
            title="Profile Visibility"
            description="Control what visitors can see."
          >
            <Toggle
              title="Show Email on Public Page"
              description="Display your account email publicly."
              checked={profile.show_email}
              onChange={(value) =>
                updateProfile(
                  "show_email",
                  value
                )
              }
            />

            <div className="mt-4">
              <Toggle
                title="Newsletter"
                description="Show newsletter availability on your profile."
                checked={
                  profile.newsletter_enabled
                }
                onChange={(value) =>
                  updateProfile(
                    "newsletter_enabled",
                    value
                  )
                }
              />
            </div>
          </Section>

          <Section
            title="Social Links"
            description="Add Instagram, X, Facebook or other social profiles."
            action={
              <button
                onClick={addSocialLink}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                + Add Social Link
              </button>
            }
          >
            {socialLinks.length === 0 ? (
              <Empty text="No social links added yet." />
            ) : (
              <div className="space-y-4">
                {socialLinks.map(
                  (link, index) => (
                    <div
                      key={
                        link.id || index
                      }
                      className="grid md:grid-cols-[180px_1fr_auto] gap-3 items-end"
                    >
                      <Input
                        label="Platform"
                        value={
                          link.platform
                        }
                        onChange={(value) =>
                          updateSocialLink(
                            index,
                            "platform",
                            value
                          )
                        }
                        placeholder="Instagram"
                      />

                      <Input
                        label="URL"
                        value={link.url}
                        onChange={(value) =>
                          updateSocialLink(
                            index,
                            "url",
                            value
                          )
                        }
                        placeholder="https://instagram.com/..."
                      />

                      <button
                        onClick={() =>
                          removeSocialLink(
                            index
                          )
                        }
                        className="h-[46px] border border-red-200 text-red-600 rounded-xl px-4"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          <Section
            title="Custom / Featured Links"
            description="Add portfolio, interviews, websites and other links."
            action={
              <button
                onClick={addCustomLink}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                + Add Link
              </button>
            }
          >
            {customLinks.length === 0 ? (
              <Empty text="No custom links added yet." />
            ) : (
              <div className="space-y-4">
                {customLinks.map(
                  (link, index) => (
                    <div
                      key={
                        link.id || index
                      }
                      className="grid md:grid-cols-[220px_1fr_auto] gap-3 items-end"
                    >
                      <Input
                        label="Link Name"
                        value={
                          link.link_name
                        }
                        onChange={(value) =>
                          updateCustomLink(
                            index,
                            "link_name",
                            value
                          )
                        }
                        placeholder="My Website"
                      />

                      <Input
                        label="URL"
                        value={link.url}
                        onChange={(value) =>
                          updateCustomLink(
                            index,
                            "url",
                            value
                          )
                        }
                        placeholder="https://..."
                      />

                      <button
                        onClick={() =>
                          removeCustomLink(
                            index
                          )
                        }
                        className="h-[46px] border border-red-200 text-red-600 rounded-xl px-4"
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          <Section
            title="Other Published Books"
            description="Add books published outside A&G PUBLICATION."
            action={
              <button
                onClick={addExternalBook}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                + Add Other Book
              </button>
            }
          >
            {externalBooks.length === 0 ? (
              <Empty text="No external books added yet." />
            ) : (
              <div className="space-y-5">
                {externalBooks.map(
                  (book, index) => (
                    <div
                      key={
                        book.id || index
                      }
                      className="border rounded-2xl p-5"
                    >
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="font-bold">
                          Book #{index + 1}
                        </h3>

                        <button
                          onClick={() =>
                            removeExternalBook(
                              index
                            )
                          }
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Book Title"
                          value={book.title}
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "title",
                              value
                            )
                          }
                          placeholder="Book title"
                        />

                        <Input
                          label="Author Name"
                          value={
                            book.author_name
                          }
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "author_name",
                              value
                            )
                          }
                          placeholder="Author name"
                        />

                        <Input
                          label="Amazon"
                          value={
                            book.amazon_url
                          }
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "amazon_url",
                              value
                            )
                          }
                          placeholder="Amazon link"
                        />

                        <Input
                          label="Flipkart"
                          value={
                            book.flipkart_url
                          }
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "flipkart_url",
                              value
                            )
                          }
                          placeholder="Flipkart link"
                        />

                        <Input
                          label="Google Books"
                          value={
                            book.google_books_url
                          }
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "google_books_url",
                              value
                            )
                          }
                          placeholder="Google Books link"
                        />

                        <Input
                          label="Kindle"
                          value={
                            book.kindle_url
                          }
                          onChange={(value) =>
                            updateExternalBook(
                              index,
                              "kindle_url",
                              value
                            )
                          }
                          placeholder="Kindle link"
                        />

                        <div className="md:col-span-2">
                          <Input
                            label="Other Link"
                            value={
                              book.other_url
                            }
                            onChange={(value) =>
                              updateExternalBook(
                                index,
                                "other_url",
                                value
                              )
                            }
                            placeholder="Other book link"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          <Section
            title="Services & Pricing"
            description="Add services that you offer to readers or authors."
            action={
              <button
                onClick={addService}
                className="bg-black text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
              >
                + Add Service
              </button>
            }
          >
            {services.length === 0 ? (
              <Empty text="No services added yet." />
            ) : (
              <div className="space-y-5">
                {services.map(
                  (service, index) => (
                    <div
                      key={
                        service.id ||
                        index
                      }
                      className="border rounded-2xl p-5"
                    >
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="font-bold">
                          Service #{index + 1}
                        </h3>

                        <button
                          onClick={() =>
                            removeService(
                              index
                            )
                          }
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          label="Service Name"
                          value={
                            service.service_name
                          }
                          onChange={(value) =>
                            updateService(
                              index,
                              "service_name",
                              value
                            )
                          }
                          placeholder="Book Editing"
                        />

                        <Input
                          label="Price"
                          type="number"
                          value={
                            service.price
                          }
                          onChange={(value) =>
                            updateService(
                              index,
                              "price",
                              value
                            )
                          }
                          placeholder="999"
                        />

                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold">
                            Description
                          </label>

                          <textarea
                            value={
                              service.description
                            }
                            onChange={(e) =>
                              updateService(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={4}
                            placeholder="Describe your service..."
                            className="w-full mt-2 border rounded-xl px-4 py-3 outline-none resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>

          <div className="flex justify-end gap-3 pb-10">
            <Link
              href="/author-dashboard"
              className="px-6 py-3 bg-white border rounded-xl font-semibold"
            >
              Back
            </Link>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-7 py-3 bg-black text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Public Profile"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  text,
  active = false,
}: {
  href: string;
  icon: string;
  text: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        active
          ? "bg-white text-black font-semibold"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      {text}
    </Link>
  );
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange?.(e.target.value)
        }
        placeholder={placeholder}
        className={`w-full mt-2 border rounded-xl px-4 py-3 outline-none ${
          disabled
            ? "bg-gray-50 text-gray-500"
            : "focus:ring-2 focus:ring-black/10"
        }`}
      />
    </div>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border rounded-2xl p-4">
      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full relative transition ${
          checked
            ? "bg-black"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed rounded-2xl p-8 text-center text-gray-500 text-sm">
      {text}
    </div>
  );
}