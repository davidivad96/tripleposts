# TriplePosts

Write once, post thrice. A web application that allows you to simultaneously post content to X (Twitter), Threads, and Bluesky.

## Features

- 🚀 Simultaneous posting to multiple platforms
- 🖼️ Support for images and carousels
- ✂️ Image cropping and editing
- 🎨 Dark/Light mode support
- ⌨️ Rich text formatting (bold, italic)
- 📱 Responsive design

## Tech Stack

- [Next.js 15](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Clerk](https://clerk.com/) for authentication
- [TipTap](https://tiptap.dev/) for rich text editing

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# X (Twitter)
X_OAUTH_CONSUMER_API_KEY=
X_OAUTH_CONSUMER_SECRET=
X_OAUTH_ACCESS_TOKEN=
X_OAUTH_ACCESS_TOKEN_SECRET=

# Threads
THREADS_APP_SECRET=

# R2 Storage
R2_BUCKET_NAME=
R2_BUCKET_PUBLIC_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=

# Database
NEON_DB_HOST=
NEON_DB_DATABASE=
NEON_DB_USER=
NEON_DB_PASSWORD=

# Others
COOKIE_SECRET=
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
