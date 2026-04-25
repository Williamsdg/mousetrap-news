// GROQ queries for Mouse Trap News
// All public-facing queries filter by status == "approved"

// Featured hero article
export const featuredArticleQuery = `
  *[_type == "article" && featured == true && status == "approved"] | order(publishedAt desc)[0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    theme,
    category->{title, slug, color, icon},
    author->{name, avatar}
  }
`

// Trending articles (top 5 most recent approved)
export const trendingArticlesQuery = `
  *[_type == "article" && status == "approved"] | order(publishedAt desc)[0..4] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    theme,
    category->{title, slug, color, icon}
  }
`

// Latest articles with pagination
export const latestArticlesQuery = `
  *[_type == "article" && status == "approved"] | order(publishedAt desc)[$start..$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    theme,
    category->{title, slug, color, icon},
    author->{name}
  }
`

// Single article by slug (approved only for public view)
export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug && status == "approved"][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    theme,
    body,
    tags,
    seo,
    category->{_id, title, slug, color, icon},
    author->{name, bio, avatar, social}
  }
`

// Related articles (same category, approved only)
export const relatedArticlesQuery = `
  *[_type == "article" && status == "approved" && category._ref == $categoryId && _id != $articleId] | order(publishedAt desc)[0..2] {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    category->{title, slug, color, icon}
  }
`

// Articles by category (approved only)
export const articlesByCategoryQuery = `
  *[_type == "article" && status == "approved" && category->slug.current == $category] | order(publishedAt desc)[$start..$end] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    theme,
    category->{title, slug, color, icon},
    author->{name}
  }
`

// All categories (count only approved articles)
export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    icon,
    color,
    description,
    image,
    "articleCount": count(*[_type == "article" && status == "approved" && references(^._id)])
  }
`

// Site settings
export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    siteName,
    tagline,
    description,
    socialLinks,
    defaultThemeRotation,
    featuredOnLogos
  }
`

// All approved article slugs (for generateStaticParams)
export const allArticleSlugsQuery = `
  *[_type == "article" && status == "approved" && defined(slug.current)].slug.current
`

// All category slugs
export const allCategorySlugsQuery = `
  *[_type == "category" && defined(slug.current)].slug.current
`
