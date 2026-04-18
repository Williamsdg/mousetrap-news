// GROQ queries for Mouse Trap News

// Featured hero article
export const featuredArticleQuery = `
  *[_type == "article" && featured == true] | order(publishedAt desc)[0] {
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

// Trending articles (top 5 most recent)
export const trendingArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[0..4] {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    theme,
    category->{title, slug, color, icon}
  }
`

// Latest articles with pagination
export const latestArticlesQuery = `
  *[_type == "article"] | order(publishedAt desc)[$start..$end] {
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

// Single article by slug
export const articleBySlugQuery = `
  *[_type == "article" && slug.current == $slug][0] {
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
    category->{title, slug, color, icon},
    author->{name, bio, avatar, social}
  }
`

// Related articles (same category, excluding current)
export const relatedArticlesQuery = `
  *[_type == "article" && category._ref == $categoryId && _id != $articleId] | order(publishedAt desc)[0..2] {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    category->{title, slug, color, icon}
  }
`

// Articles by category
export const articlesByCategoryQuery = `
  *[_type == "article" && category->slug.current == $category] | order(publishedAt desc)[$start..$end] {
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

// All categories
export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    icon,
    color,
    description,
    image,
    "articleCount": count(*[_type == "article" && references(^._id)])
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

// All article slugs (for generateStaticParams)
export const allArticleSlugsQuery = `
  *[_type == "article" && defined(slug.current)].slug.current
`

// All category slugs
export const allCategorySlugsQuery = `
  *[_type == "category" && defined(slug.current)].slug.current
`
