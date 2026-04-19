import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

function block(key, text, style = 'normal') {
  return { _type: 'block', _key: key, style, children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }] }
}

function richBlock(key, children, style = 'normal') {
  return { _type: 'block', _key: key, style, children }
}

function span(key, text, marks = []) {
  return { _type: 'span', _key: key, text, marks }
}

const articles = [
  // MAGIC KINGDOM x2
  { _id: 'article-mk-pirates', title: 'Pirates of the Caribbean Now Requires Real Sword Fighting Skills', slug: 'pirates-caribbean-requires-real-sword-fighting', category: 'cat-magic-kingdom',
    excerpt: 'Disney has raised the bar for ride immersion by requiring all guests to pass a basic sword fighting proficiency test before boarding Pirates of the Caribbean.',
    image: 'https://images.unsplash.com/photo-1559673874-954345907917?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'In an unprecedented move toward '), span('s2', '"extreme immersion,"', ['em']), span('s3', ' Disney has announced that all guests must pass a Level 1 Sword Proficiency Test before boarding Pirates of the Caribbean. The test includes basic parrying, a dramatic "Arrr!" assessment, and a written portion on pirate history.')]),
      block('b2', 'The Testing Process', 'h2'),
      block('b3', 'Guests will report to a new facility called "The Pirate Academy" located next to the ride entrance. The 45-minute course covers basic cutlass handling, plank walking technique, and mandatory eye patch fitting. Those who fail receive a "Landlubber" badge and are redirected to It\'s a Small World.'),
      block('b4', '"We found that guests enjoy the ride 340% more when they\'re genuinely afraid for their safety," said a fictional Disney spokesperson. "Nothing enhances the pirate experience like real-world consequences."'),
      { _type: 'block', _key: 'b5', style: 'blockquote', children: [span('s4', '"I failed the sword test three times but finally got my Pirate License on the fourth try. The ride was incredible — mostly because of the adrenaline from nearly falling out of the boat." — Fictional guest')] },
      block('b6', 'Annual passholders can pre-certify online for an additional $49.99 convenience fee.'),
    ], tags: ['Magic Kingdom', 'Pirates', 'Rides'] },

  { _id: 'article-mk-smallworld', title: 'It\'s a Small World Boat Gets Stuck, Passengers Form New Society', slug: 'its-a-small-world-boat-stuck-passengers-form-society', category: 'cat-magic-kingdom',
    excerpt: 'After an It\'s a Small World boat was stuck for 47 minutes, passengers reportedly established a democratic government, elected a president, and were negotiating trade agreements with the neighboring boat.',
    image: 'https://images.unsplash.com/photo-1625932269987-a57954d69e9e?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'What began as a routine '), span('s2', '47-minute breakdown', ['strong']), span('s3', ' on It\'s a Small World quickly evolved into what sociologists are calling "the fastest formation of a democratic society in human history." By minute 12, passengers had drafted a constitution. By minute 30, they had a functioning economy based on Goldfish crackers.')]),
      block('b2', 'The Birth of a Nation', 'h2'),
      block('b3', 'The newly formed Republic of Smallworldia established its capital in the France section of the ride, citing "superior cheese availability" and "the only animatronic that wasn\'t staring directly into our souls." A woman from Ohio was elected president on a platform of "getting us out of here" and "making the song stop."'),
      block('b4', 'The neighboring boat, stuck 15 feet ahead, was initially viewed as a rival nation until diplomatic relations were established through the exchange of a juice box and half a pretzel.'),
      { _type: 'block', _key: 'b5', style: 'blockquote', children: [span('s4', '"By minute 40, we had a national anthem, a flag made from a Disney poncho, and a surprisingly robust tax code. When the ride finally restarted, there were tears." — President of Smallworldia')] },
    ], tags: ['Magic Kingdom', 'Small World', 'Rides'] },

  // EPCOT x2
  { _id: 'article-epcot-drink', title: 'EPCOT Guest Completes Drink Around the World in 11 Minutes, Sets Record', slug: 'epcot-drink-around-world-11-minutes-record', category: 'cat-epcot',
    excerpt: 'A Florida man has shattered the unofficial Drink Around the World record at EPCOT, completing all 11 World Showcase countries in just 11 minutes flat.',
    image: 'https://images.unsplash.com/photo-1553526665-dbfe3e8a6fcc?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'A 34-year-old Florida man identified only as '), span('s2', '"Chad from Tampa"', ['strong']), span('s3', ' has set what he claims is the unofficial world record for Drinking Around the World at EPCOT, completing all 11 World Showcase pavilions in 11 minutes and 4 seconds.')]),
      block('b2', 'The Strategy', 'h2'),
      block('b3', 'Chad reportedly trained for six months using a combination of "aggressive hydration," "strategic pre-gaming," and a custom running route that he mapped using military-grade GPS software. His strategy involved ordering drinks in advance through the My Disney Experience app and having his support team (his wife and her reluctant friend) position beverages at each pavilion.'),
      block('b4', '"The key was treating it like a NASCAR pit stop at every country," Chad explained from a bench in the Japan pavilion where he was recovering. "You can\'t sip. You have to commit."'),
      { _type: 'block', _key: 'b5', style: 'blockquote', children: [span('s5', '"He ran past me in the UK pavilion screaming \'FOR FLORIDA!\' while chugging a pint of warm cider. It was the most American thing I\'ve ever seen at a fake version of England." — Bystander')] },
    ], tags: ['EPCOT', 'World Showcase', 'Drinking'] },

  { _id: 'article-epcot-test', title: 'Test Track Now Lets Guests Design Real Cars That Must Pass Safety Inspection', slug: 'test-track-design-real-cars-safety-inspection', category: 'cat-epcot',
    excerpt: 'EPCOT\'s Test Track has been upgraded to let guests design actual functioning vehicles that must pass a real Florida DMV safety inspection before they can exit the building.',
    image: 'https://images.unsplash.com/photo-1609048296073-344867b42508?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'In a partnership with the Florida Department of Motor Vehicles that absolutely nobody asked for, EPCOT\'s Test Track now requires guests to design '), span('s2', 'actual functioning vehicles', ['strong']), span('s3', ' that must pass a real state safety inspection before riders can leave the attraction.')]),
      block('b2', 'The New Experience', 'h2'),
      block('b3', 'The upgraded ride experience begins with a 3-hour engineering course where guests learn basic automotive design principles, Florida traffic law, and how to fill out DMV Form 82040. Guests then design their vehicle using industrial CAD software, which is assembled in real-time by robotic arms during the ride portion.'),
      block('b4', '"The average wait time has increased from 90 minutes to approximately 4-6 business days," a cast member explained. "But guests really appreciate the sense of accomplishment when their car passes emissions testing."'),
      { _type: 'block', _key: 'b5', style: 'blockquote', children: [span('s5', '"I came to ride a roller coaster and left with a registered motor vehicle and a deep understanding of axle specifications. Disney magic is real." — Guest')] },
    ], tags: ['EPCOT', 'Test Track', 'Rides'] },

  // HOLLYWOOD STUDIOS x2
  { _id: 'article-hs-tower', title: 'Tower of Terror Elevator Now Goes to Actual Apartments on Upper Floors', slug: 'tower-terror-elevator-actual-apartments', category: 'cat-hollywood-studios',
    excerpt: 'Disney has converted the upper floors of the Hollywood Tower Hotel into luxury apartments, and Tower of Terror riders now occasionally stop on residential floors where tenants are "not thrilled about the screaming."',
    image: 'https://images.unsplash.com/photo-1607008914608-7e83e004231a?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'In a creative real estate move, Disney has converted floors 7 through 13 of the Hollywood Tower Hotel into '), span('s2', 'luxury apartments', ['strong']), span('s3', ' starting at $8,500/month. The only catch: the Tower of Terror elevator occasionally stops on residential floors, exposing tenants to 12 seconds of bloodcurdling screams from terrified tourists.')]),
      block('b2', 'Living the Dream (and the Nightmare)', 'h2'),
      block('b3', 'Current residents report that the experience is "mostly fine" except during peak season when the elevator stops on their floor up to 47 times per day. "I\'ve learned to eat dinner with noise-canceling headphones and a sense of humor," said one tenant. "The rent includes a Genie+ subscription, so it evens out."'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"I was making breakfast in my bathrobe when the elevator doors opened and 22 people screamed at me. I screamed back. Now we do this every morning. It\'s my routine." — Floor 9 resident')] },
    ], tags: ['Hollywood Studios', 'Tower of Terror', 'Housing'] },

  // ANIMAL KINGDOM x2
  { _id: 'article-ak-dinosaur', title: 'Dinosaur Ride Now Uses Real Fossils That Guests Must Personally Excavate', slug: 'dinosaur-ride-real-fossils-excavate', category: 'cat-animal-kingdom',
    excerpt: 'Animal Kingdom\'s DINOSAUR attraction has been reimagined as a participatory archaeological dig where guests must excavate real fossils before the ride vehicle will move.',
    image: 'https://images.unsplash.com/photo-1612738331950-40abbddce9aa?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'Animal Kingdom\'s DINOSAUR attraction has been completely reimagined as a '), span('s2', 'participatory archaeological experience', ['strong']), span('s3', ' where guests must excavate actual fossils before the ride vehicle will advance to the next scene. Average ride time has increased from 3.5 minutes to approximately 6 weeks.')]),
      block('b2', 'The New Dig Experience', 'h2'),
      block('b3', 'Upon boarding, each guest receives a pickaxe, a brush, and a "Paleontology for Theme Park Guests" handbook. The ride vehicle remains stationary until at least one guest in the vehicle successfully uncovers a bone fragment of "archaeological significance," as determined by a cast member with a clipboard and a flashlight.'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"My family has been on this ride for three days. We\'ve found two vertebrae and what appears to be a petrified turkey leg from the Cretaceous period. Send snacks." — Guest currently still on the ride')] },
    ], tags: ['Animal Kingdom', 'Dinosaur', 'Rides'] },

  // FOOD x2
  { _id: 'article-food-dolewhip', title: 'Dole Whip Now Available in 47 Flavors Including "Existential Dread"', slug: 'dole-whip-47-flavors-existential-dread', category: 'cat-food',
    excerpt: 'Disney has expanded its beloved Dole Whip menu to include 47 new flavors, ranging from "Tropical Sunset" to the controversial new option "Existential Dread," which tastes like pineapple but makes you question your life choices.',
    image: 'https://images.unsplash.com/photo-1590926412950-0f1a5ce1660?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'Disney has expanded its beloved Dole Whip menu to 47 flavors, including the controversial new addition '), span('s2', '"Existential Dread,"', ['em']), span('s3', ' which Disney describes as "pineapple-forward with notes of crushed dreams and a surprisingly refreshing finish." The flavor has already become the park\'s third best-seller behind "Classic Pineapple" and "I Can\'t Believe I Paid $9 For This."')]),
      block('b2', 'Notable New Flavors', 'h2'),
      block('b3', 'Other additions include "Space Mountain Mint" (tastes like speed and regret), "It\'s a Small World Vanilla" (pleasant at first but becomes unbearable after 30 seconds), "Annual Passholder Rage" (spicy), and "Lightning Lane Lemon" (costs three times as much for no discernible improvement in taste).'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"The Existential Dread flavor is honestly the most accurate thing Disney has ever created. It captures the exact feeling of checking your bank account after a Disney vacation." — Food critic')] },
    ], tags: ['Food', 'Dole Whip', 'Dining'] },

  // CAST MEMBERS x2
  { _id: 'article-cast-point', title: 'Cast Members Develop Supernatural Ability to Point With Two Fingers', slug: 'cast-members-supernatural-two-finger-pointing', category: 'cat-cast-members',
    excerpt: 'Scientists have discovered that Disney Cast Members develop an irreversible neurological adaptation that makes them physically incapable of pointing with one finger, even outside of work.',
    image: 'https://images.unsplash.com/photo-1602940634905-b24a98903707?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'A groundbreaking study from the '), span('s2', 'University of Fictional Science', ['em']), span('s3', ' has confirmed what many suspected: Disney Cast Members develop a permanent neurological condition that makes them physically unable to point with a single finger. The phenomenon, dubbed "Disney Digit Syndrome," affects 100% of cast members within their first 90 days of employment.')]),
      block('b2', 'The Science', 'h2'),
      block('b3', 'Researchers found that the two-finger point — traditionally taught to avoid the rudeness of single-finger pointing — becomes hardwired into cast members\' motor cortex after approximately 200 hours of training. Former cast members report being unable to give normal directions, hail taxis, or accuse anyone of anything for the rest of their lives.'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"I left Disney six years ago and I still can\'t point normally. I tried to point out a bird to my kids last week and accidentally directed them to both the bird AND the nearest restroom. It\'s who I am now." — Former cast member')] },
    ], tags: ['Cast Members', 'Training', 'Culture'] },

  // RESORTS x2
  { _id: 'article-resorts-pool', title: 'Disney Resort Pool Now Requires Reservation, Background Check, and Letter of Recommendation', slug: 'disney-resort-pool-reservation-background-check', category: 'cat-resorts',
    excerpt: 'Guests at Disney\'s Grand Floridian Resort must now submit a formal application to use the pool, including two letters of recommendation and a 500-word essay on "What Swimming Means to Me."',
    image: 'https://images.unsplash.com/photo-1565798528166-405bba484eca?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'In what Disney calls a '), span('s2', '"premium aquatic experience management initiative,"', ['em']), span('s3', ' guests at the Grand Floridian Resort must now complete a formal application process to access the pool. The application includes a credit check, two professional references, a 500-word personal essay, and a "splash audition" evaluated by a panel of three cast members.')]),
      block('b2', 'The Application Process', 'h2'),
      block('b3', 'Applicants must submit their materials at least 72 hours before their desired swim time. The essay prompt changes weekly, but recent topics have included "What Swimming Means to Me," "Describe a Time You Used a Towel Responsibly," and "Why Do You Deserve to Be Wet?"'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"My application was rejected twice before I was finally approved for a 45-minute pool window between 2:15 and 3:00 PM on a Tuesday. It was the most exclusive pool experience of my life." — Guest')] },
    ], tags: ['Resorts', 'Pool', 'Grand Floridian'] },

  // SPORTS x2
  { _id: 'article-sports-marathon', title: 'runDisney Marathon Now Includes Mandatory Stop at Every Gift Shop Along Route', slug: 'rundisney-marathon-mandatory-gift-shop-stops', category: 'cat-sports',
    excerpt: 'The runDisney Marathon has been updated to include mandatory 10-minute stops at every gift shop along the 26.2-mile course, adding approximately 4 hours and $800 in souvenir purchases to each runner\'s time.',
    image: 'https://images.unsplash.com/photo-1489368066883-369c64aa01bd?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'The runDisney Marathon has introduced '), span('s2', 'mandatory retail stops', ['strong']), span('s3', ' at every gift shop along the 26.2-mile course. Runners must spend a minimum of 10 minutes and $50 at each of the 16 shops, adding approximately 4 hours and $800 to the race experience. Finishing times will be adjusted to include "Shopping Pace" alongside traditional mile splits.')]),
      block('b2', 'The New Rules', 'h2'),
      block('b3', 'Race bibs now include an RFID chip that tracks both running pace and spending velocity. Runners who fail to meet the $50 minimum at any shop are penalized with a 30-minute timeout in a designated "Shopping Reflection Zone" where they must browse Disney pins until they find one they "genuinely connect with."'),
      { _type: 'block', _key: 'b4', style: 'blockquote', children: [span('s4', '"I finished the marathon in 11 hours and 47 minutes with a shopping total of $1,247. My personal best in both categories. The medal is nice but the real prize is the Spirit Jersey I bought at mile 18." — Runner')] },
    ], tags: ['Sports', 'Marathon', 'runDisney'] },

  // MOVIES x2
  { _id: 'article-movies-frozen', title: 'Frozen 4 Will Take Place Entirely in the Gift Shop', slug: 'frozen-4-takes-place-entirely-in-gift-shop', category: 'cat-movies',
    excerpt: 'Disney has announced that Frozen 4 will be set entirely inside a Disney theme park gift shop, following Elsa as she navigates crowds, overpriced merchandise, and a 45-minute checkout line.',
    image: 'https://images.unsplash.com/photo-1609392922126-dc73ae3ea7e6?w=1600&auto=format&fit=crop&q=80',
    body: [
      richBlock('b1', [span('s1', 'Disney Animation Studios has revealed that '), span('s2', 'Frozen 4', ['strong']), span('s3', ' will be set entirely inside a Disney theme park gift shop. The film follows Elsa as she attempts to purchase a single keychain while navigating crowds, a broken register, and a family of 12 who insists on individually personalizing every ornament in the store.')]),
      block('b2', 'The Plot', 'h2'),
      block('b3', 'The screenplay, which Disney describes as "our most realistic film to date," follows Elsa through a 90-minute checkout experience that includes three price checks, a coupon that won\'t scan, and a dramatic third-act climax where she discovers the item she wanted was only available at the other park.'),
      block('b4', 'Anna joins as a supporting character who spends the entire film saying "we should probably go, the fireworks start in 20 minutes" while Olaf melts from standing too close to the candle display.'),
      { _type: 'block', _key: 'b5', style: 'blockquote', children: [span('s5', '"Let It Go has been reimagined as a power ballad about releasing your credit card information to the chip reader. It\'s our most emotional song yet." — Fictional Disney composer')] },
    ], tags: ['Movies', 'Frozen', 'Animation'] },
]

async function seedArticles() {
  console.log('Seeding additional articles with images...\n')

  for (const article of articles) {
    // Download and upload image
    let imageRef = null
    try {
      console.log(`  Downloading image for: ${article.title.substring(0, 50)}...`)
      const imgRes = await fetch(article.image)
      if (imgRes.ok) {
        const buf = Buffer.from(await imgRes.arrayBuffer())
        const asset = await client.assets.upload('image', buf, {
          filename: `${article.slug}.jpg`,
          contentType: 'image/jpeg',
        })
        imageRef = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      }
    } catch (e) {
      console.log(`    Image failed: ${e.message}`)
    }

    const doc = {
      _id: article._id,
      _type: 'article',
      title: article.title,
      slug: { _type: 'slug', current: article.slug },
      author: { _type: 'reference', _ref: 'author-mousetrap' },
      category: { _type: 'reference', _ref: article.category },
      theme: 'auto',
      status: 'approved',
      featured: false,
      publishedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt: article.excerpt,
      body: article.body,
      tags: article.tags,
      approvedAt: new Date().toISOString(),
      approvedBy: 'Michael Morrow',
      ...(imageRef && { mainImage: imageRef }),
    }

    await client.createOrReplace(doc)
    console.log(`  ✓ [${article.category.replace('cat-', '')}] ${article.title.substring(0, 60)}...\n`)
  }

  console.log(`Done! ${articles.length} articles seeded.`)
}

seedArticles().catch(console.error)
