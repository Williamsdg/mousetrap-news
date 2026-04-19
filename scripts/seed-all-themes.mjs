import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

function block(key, text, style = 'normal', marks = []) {
  return {
    _type: 'block',
    _key: key,
    style,
    children: [{ _type: 'span', _key: `${key}s`, text, marks }],
  }
}

function richBlock(key, children, style = 'normal') {
  return { _type: 'block', _key: key, style, children }
}

function span(key, text, marks = []) {
  return { _type: 'span', _key: key, text, marks }
}

const articles = [
  {
    _id: 'article-mk-fireworks',
    title: 'Disney Announces Fireworks Will Now Be Replaced With Confetti Cannons',
    slug: 'disney-announces-fireworks-replaced-with-confetti-cannons',
    category: 'cat-magic-kingdom',
    excerpt: "In a shocking move that has park-goers clutching their glow sticks, Disney World has announced that all fireworks shows will be replaced with industrial-grade confetti cannons starting next month.",
    body: [
      richBlock('b1', [
        span('s1', 'In a '),
        span('s2', 'shocking move', ['strong']),
        span('s3', ' that has park-goers clutching their glow sticks, Disney World has announced that all fireworks shows will be replaced with industrial-grade confetti cannons starting next month. The decision, which we completely made up, came after a committee of '),
        span('s4', 'entirely fictional executives', ['em']),
        span('s5', ' determined that "sparkly paper is just as magical as controlled explosions."'),
      ]),
      block('b2', 'The Reasoning Behind the Change', 'h2'),
      block('b3', 'According to our fabricated sources, the switch to confetti cannons will save Disney approximately $47 million per year in pyrotechnics costs. The money will reportedly be redirected to a new program called "Project Glitter," which aims to cover every surface in Magic Kingdom with a thin layer of biodegradable sparkle dust.'),
      block('b4', '"We realized that what guests really want isn\'t the thundering boom of fireworks echoing across the Seven Seas Lagoon," said a spokesperson we invented. "They want to be pelted with tiny pieces of paper while \'A Whole New World\' plays at maximum volume."'),
      block('b5', 'What This Means for Annual Passholders', 'h2'),
      richBlock('b6', [
        span('s6', 'Annual passholders have expressed '),
        span('s7', 'mixed reactions', ['strong']),
        span('s8', ' to the announcement. Some have already started online petitions with titles like "Save Our Sparks" and "Confetti Is Not Magic." Others have embraced the change, noting that confetti is '),
        span('s9', 'easier to photograph', ['em']),
        span('s10', ' than fireworks.'),
      ]),
      { _type: 'block', _key: 'b7', style: 'blockquote', children: [span('s11', '"I spent $14,000 on my annual pass and now I\'m going to watch paper fall from the sky? This is the greatest betrayal since they closed Mr. Toad\'s Wild Ride." — Anonymous Passholder')] },
      block('b8', 'The Environmental Angle', 'h3'),
      block('b9', 'Disney claims the confetti will be made from 100% recycled park maps that guests threw away without ever reading. Each piece of confetti will be stamped with a tiny QR code that links to the My Disney Experience app, because of course it will.'),
      block('b10', 'The new confetti shows are expected to debut during the "Festival of Fantasy Fallout" event this spring. Ponchos will be sold separately for $34.99.'),
    ],
    tags: ['Magic Kingdom', 'Fireworks', 'Satire', 'Annual Passholders'],
  },
  {
    _id: 'article-epcot-country',
    title: 'EPCOT Adding Fictional Country to World Showcase Called "Disneylandia"',
    slug: 'epcot-adding-fictional-country-disneylandia',
    category: 'cat-epcot',
    excerpt: "Walt Disney World has announced plans to add an 12th pavilion to EPCOT's World Showcase — a completely fictional country called Disneylandia, featuring its own flag, national anthem, and mandatory churro consumption.",
    body: [
      richBlock('b1', [
        span('s1', 'Walt Disney World has announced plans to add a 12th pavilion to EPCOT\'s World Showcase — a completely fictional country called '),
        span('s2', 'Disneylandia', ['strong']),
        span('s3', ', featuring its own flag, national anthem, and mandatory churro consumption. The pavilion will be located between France and Morocco, in a space that Disney insists "was always there, you just weren\'t looking hard enough."'),
      ]),
      block('b2', 'The National Identity of Disneylandia', 'h2'),
      block('b3', 'According to the completely fabricated lore, Disneylandia was founded in 1923 by a mysterious figure known only as "Uncle Walt." The country\'s national currency is the "MagicBuck," which is valued at exactly 1.47 times the US dollar but can only be spent on turkey legs and Dole Whip.'),
      richBlock('b4', [
        span('s4', 'The national language of Disneylandia is described as "English but with '),
        span('s5', 'unnecessary exclamation points', ['em']),
        span('s6', ' and a legal requirement to say \'have a magical day\' at the end of every sentence."'),
      ]),
      block('b5', 'What to Expect in the Pavilion', 'h2'),
      block('b6', 'The Disneylandia pavilion will feature a sit-down restaurant called "The Enchanted Fork" where every meal costs exactly $59.99 and comes with a complimentary autographed napkin. The menu will exclusively serve foods that are "Instagram-worthy but nutritionally questionable."'),
      { _type: 'block', _key: 'b7', style: 'blockquote', children: [span('s7', '"We\'ve created a country where the national sport is waiting in line and the weather is always \'pleasantly humid.\' It\'s basically Florida with better branding." — Fictional Disney Imagineer')] },
      block('b8', 'The pavilion is expected to open in 2089, which Disney describes as "sooner than you think" but most people describe as "not in my lifetime."'),
    ],
    tags: ['EPCOT', 'World Showcase', 'Satire', 'New Attractions'],
  },
  {
    _id: 'article-hs-stunt',
    title: 'Hollywood Studios Stunt Show Now Requires Audience Participation',
    slug: 'hollywood-studios-stunt-show-requires-audience-participation',
    category: 'cat-hollywood-studios',
    excerpt: "In a bold new direction for live entertainment, Disney has announced that the Hollywood Studios stunt show will now pull random audience members on stage to perform actual stunts, including a 40-foot fall into an airbag.",
    body: [
      richBlock('b1', [
        span('s1', 'In a '),
        span('s2', 'bold new direction', ['strong']),
        span('s3', ' for live entertainment, Disney has announced that the Hollywood Studios stunt show will now pull random audience members on stage to perform actual stunts. Participants will be selected using a proprietary algorithm that factors in "willingness to sign a waiver" and "how many churros they\'ve consumed in the last hour."'),
      ]),
      block('b2', 'The New Format', 'h2'),
      richBlock('b3', [
        span('s4', 'The redesigned show, titled '),
        span('s5', '"Lights, Camera, Liability!"', ['em']),
        span('s6', ', will feature three tiers of audience stunts ranging from "mildly alarming" to "your health insurance better be current."'),
      ]),
      block('b4', 'Tier 1 involves being gently pushed off a 6-foot platform into foam blocks. Tier 2 includes a simulated car chase where guests ride in a golf cart at speeds of up to 12 mph. Tier 3 — reserved for what Disney calls "the truly brave or truly foolish" — involves a 40-foot controlled fall into a giant airbag shaped like Mickey\'s head.'),
      block('b5', 'Safety Concerns', 'h2'),
      block('b6', 'When asked about safety protocols, Disney reportedly responded: "Every guest who participates receives a complimentary Band-Aid and a FastPass to the First Aid station. We also have a photographer on standby to capture the exact moment of regret on their faces."'),
      { _type: 'block', _key: 'b7', style: 'blockquote', children: [span('s7', '"I came to Hollywood Studios to ride Tower of Terror, not become a human stunt double. But honestly? The FastPass to First Aid is a pretty good deal." — Audience member who definitely doesn\'t exist')] },
      block('b8', 'Waivers will be available in 14 languages and can be pre-signed through the My Disney Experience app for an additional $19.99 convenience fee.'),
    ],
    tags: ['Hollywood Studios', 'Stunt Show', 'Satire', 'Live Entertainment'],
  },
  {
    _id: 'article-ak-safari',
    title: 'Animal Kingdom Safari Animals Now Demanding Tips from Guests',
    slug: 'animal-kingdom-safari-animals-demanding-tips',
    category: 'cat-animal-kingdom',
    excerpt: "Guests on the Kilimanjaro Safaris ride at Animal Kingdom are reporting that the animals have started positioning themselves near the vehicles with expectant looks, and one giraffe was spotted holding a sign reading 'Tips Appreciated.'",
    body: [
      richBlock('b1', [
        span('s1', 'Guests on the Kilimanjaro Safaris ride at Animal Kingdom are reporting increasingly '),
        span('s2', 'transactional behavior', ['strong']),
        span('s3', ' from the wildlife. Multiple visitors claim that a giraffe stationed near the vehicle path has been spotted holding a crudely made sign reading "Tips Appreciated — Venmo @TallBoi_Safari."'),
      ]),
      block('b2', 'The Growing Trend', 'h2'),
      block('b3', 'It started with the elephants, who began positioning themselves at photogenic angles only when guests held up their phones. Within weeks, the behavior spread across species. The hippos now do a synchronized swimming routine, the lions pose dramatically on rocks, and one particularly entrepreneurial ostrich has reportedly started charging $5 for selfies.'),
      block('b4', 'How the Animals Learned Economics', 'h3'),
      richBlock('b5', [
        span('s4', 'Disney zoologists are baffled by how quickly the animals grasped the concept of '),
        span('s5', 'a service-based economy', ['em']),
        span('s6', '. "We think it started when a guest accidentally dropped a $20 bill near the zebra enclosure," said a keeper we made up. "The zebras immediately began doing tricks. Within a day, they had established a pricing structure."'),
      ]),
      { _type: 'block', _key: 'b6', style: 'blockquote', children: [span('s7', '"The rhino won\'t even look at you unless you hold up a Starbucks gift card. I respect the hustle." — Totally fictional safari guest')] },
      block('b7', 'Disney has reportedly installed tiny Venmo QR codes on each animal\'s enclosure placard, with 85% of tips going directly to the animals\' enrichment fund and 15% going to "Disney\'s Administrative Wildlife Processing Fee."'),
    ],
    tags: ['Animal Kingdom', 'Safari', 'Satire', 'Animals'],
  },
  {
    _id: 'article-movies-sequel',
    title: 'Disney Announces Live-Action Remake of the Live-Action Remake of The Lion King',
    slug: 'disney-announces-live-action-remake-of-live-action-remake-lion-king',
    category: 'cat-movies',
    excerpt: "In a move that has Hollywood questioning the very concept of originality, Disney has greenlit a live-action remake of the 2019 live-action remake of The Lion King, which was itself a remake of the 1994 animated classic.",
    body: [
      richBlock('b1', [
        span('s1', 'In a move that has Hollywood questioning the very concept of '),
        span('s2', 'originality', ['strong']),
        span('s3', ', Disney has greenlit a live-action remake of the 2019 live-action remake of The Lion King, which was itself a remake of the 1994 animated classic. The project, internally called "Lion King 1.2," will reportedly feature "even more realistic CGI animals that still somehow can\'t convey basic emotions."'),
      ]),
      block('b2', 'Why Remake a Remake?', 'h2'),
      block('b3', 'According to a Disney executive we fabricated entirely, the decision was simple: "The 2019 version made $1.6 billion. If we just keep remaking it, we\'ll eventually have all the money in the world. It\'s basic math."'),
      block('b4', 'The new version will be distinguished from its predecessors by making the animals "25% fluffier" and giving Scar a redemption arc where he opens a vegan restaurant in the Pride Lands called "Beyond Wildebeest."'),
      block('b5', 'Cast and Production', 'h2'),
      richBlock('b6', [
        span('s4', 'While no casting has been announced, sources say Disney is looking for actors who can '),
        span('s5', '"express deep existential crisis through the medium of a photorealistic lion face."', ['em']),
        span('s6', ' The film\'s working tagline is "Remember Who You Are, Again, For the Third Time."'),
      ]),
      { _type: 'block', _key: 'b7', style: 'blockquote', children: [span('s7', '"At this rate, by 2045 we\'ll have a live-action remake of the live-action remake of the live-action remake. And it will still make a billion dollars." — Industry analyst who we invented')] },
      block('b8', 'The film is scheduled for release in 2028, exclusively in theaters for approximately 11 minutes before being moved to Disney+ with a Premier Access surcharge.'),
    ],
    tags: ['Movies', 'Lion King', 'Remake', 'Satire'],
  },
  {
    _id: 'article-sports-mascot',
    title: 'ESPN Wide World of Sports Introduces Competitive Park Walking as Official Sport',
    slug: 'espn-wide-world-sports-competitive-park-walking',
    category: 'cat-sports',
    excerpt: "Disney's ESPN Wide World of Sports complex has officially recognized Competitive Park Walking as its newest sport, complete with rankings, medals, and a training program that involves walking 30,000 steps while carrying a stroller full of souvenirs.",
    body: [
      richBlock('b1', [
        span('s1', 'Disney\'s ESPN Wide World of Sports complex has officially recognized '),
        span('s2', 'Competitive Park Walking', ['strong']),
        span('s3', ' as its newest sanctioned sport. The announcement comes after years of Disney guests unknowingly training for the event by walking an average of 30,000 steps per park day while carrying backpacks, strollers, and the emotional weight of spending $200 on lunch.'),
      ]),
      block('b2', 'The Rules of Competition', 'h2'),
      block('b3', 'Competitors must complete a regulation Disney Park Course — 14.2 miles through all four parks — while carrying at minimum one oversized plush toy, two refillable popcorn buckets, and a child who "doesn\'t want to walk anymore." Bonus points are awarded for maintaining a pace above 3.5 mph while wearing flip-flops.'),
      block('b4', 'Training and Rankings', 'h3'),
      richBlock('b5', [
        span('s4', 'Disney has already established a '),
        span('s5', 'Professional Park Walking League (PPWL)', ['em']),
        span('s6', ' with divisions based on age, fitness level, and "willingness to power-walk through Fantasyland at rope drop." The current world record holder reportedly completed the course in 4 hours and 12 minutes while somehow also riding Space Mountain twice.'),
      ]),
      { _type: 'block', _key: 'b6', style: 'blockquote', children: [span('s7', '"I\'ve been training for this my whole life. Every family vacation was preparation. My Apple Watch says I walk 47 miles every Disney trip. It\'s time I got a medal for it." — Fictional founding athlete of the PPWL')] },
      block('b7', 'Registration for the inaugural season opens next month. Entry fee is $299, which Disney notes is "significantly less than a day of food and souvenirs."'),
    ],
    tags: ['Sports', 'ESPN', 'Satire', 'Walking'],
  },
  {
    _id: 'article-resorts-upgrade',
    title: 'Disney Resort Guests Can Now Pay $500 Extra to Sleep in an Actual Bed',
    slug: 'disney-resort-guests-pay-extra-sleep-actual-bed',
    category: 'cat-resorts',
    excerpt: "In what Disney is calling a 'premium comfort enhancement,' resort guests at select Value resorts can now upgrade from the standard 'decorative sleeping surface' to what the company describes as 'a real bed with an actual mattress.'",
    body: [
      richBlock('b1', [
        span('s1', 'In what Disney is calling a '),
        span('s2', '"premium comfort enhancement,"', ['em']),
        span('s3', ' resort guests at select Value resorts can now upgrade from the standard "decorative sleeping surface" to what the company describes as "a real bed with an actual mattress." The upgrade costs $500 per night and includes revolutionary features such as "sheets that aren\'t scratchy" and "a pillow with more than 2 inches of loft."'),
      ]),
      block('b2', 'The Tier System', 'h2'),
      richBlock('b3', [
        span('s4', 'Disney has introduced a three-tier sleeping experience across its resort portfolio. The base tier, called '),
        span('s5', '"Disney Dreams Basic,"', ['strong']),
        span('s6', ' includes the existing sleeping surface and a thin blanket that Disney describes as "imagination-weight." The mid-tier "Disney Dreams Plus" ($500/night extra) adds an actual mattress. The premium tier "Disney Dreams Ultimate" ($1,200/night extra) includes a mattress, a second pillow, and a door that fully closes.'),
      ]),
      block('b4', 'Guest Reactions', 'h2'),
      block('b5', 'The announcement has been met with the kind of resigned acceptance that Disney fans have perfected over decades of price increases. "At this point, I\'m just grateful they haven\'t started charging per dream," said one guest who we completely fabricated.'),
      { _type: 'block', _key: 'b6', style: 'blockquote', children: [span('s7', '"The \'premium comfort enhancement\' is literally just a normal hotel bed. But it has a Mickey-shaped pillow mint, so I guess that justifies the $500." — Fictional resort reviewer')] },
      block('b7', 'Disney has also announced a loyalty program where guests who spend $10,000 or more on sleeping upgrades in a calendar year receive a complimentary "I Slept at Disney" commemorative pin.'),
    ],
    tags: ['Resorts', 'Hotels', 'Satire', 'Pricing'],
  },
  {
    _id: 'article-cast-uniform',
    title: 'Cast Members Now Required to Smile for Minimum of 8 Consecutive Hours',
    slug: 'cast-members-required-smile-8-consecutive-hours',
    category: 'cat-cast-members',
    excerpt: "Disney has introduced a new workplace policy requiring all Cast Members to maintain a continuous smile for their entire 8-hour shift, monitored by AI-powered 'Happiness Detection Cameras' installed throughout the parks.",
    body: [
      richBlock('b1', [
        span('s1', 'Disney has introduced a new workplace policy requiring all Cast Members to maintain a '),
        span('s2', 'continuous smile', ['strong']),
        span('s3', ' for their entire 8-hour shift. The policy, titled "Operation Permanent Joy," will be enforced by AI-powered "Happiness Detection Cameras" installed at 47,000 locations throughout the parks. Cast Members whose smile drops below a "Level 7 Enchantment" will receive an automatic notification on their work tablet.'),
      ]),
      block('b2', 'The Smile Scale', 'h2'),
      block('b3', 'Disney has developed a proprietary 10-point smile scale ranging from "Level 1: Existential Dread" to "Level 10: Just Won the Lottery While Riding Space Mountain." Cast Members are expected to maintain at minimum a "Level 7: Genuinely Delighted to Tell You the Wait Time for Peter Pan is 180 Minutes."'),
      block('b4', 'Training and Support', 'h3'),
      richBlock('b5', [
        span('s4', 'To help Cast Members achieve sustained joy, Disney has opened a new facility called the '),
        span('s5', '"Smile Lab"', ['em']),
        span('s6', ' where employees practice smiling techniques for up to 3 hours before each shift. The training includes modules like "Advanced Teeth Display," "Smiling Through Rain and Guest Complaints," and "How to Smile While Someone Asks You Where the Bathroom Is for the 400th Time Today."'),
      ]),
      { _type: 'block', _key: 'b6', style: 'blockquote', children: [span('s7', '"My face hurts and my cheeks have developed their own weather system, but at least my Happiness Score is a 7.3. That\'s almost a personal best." — Fictional Cast Member')] },
      block('b7', 'Cast Members who maintain a Level 8 or above for an entire quarter will receive a $25 Disney gift card and a certificate reading "Your Joy Is Our Profit."'),
    ],
    tags: ['Cast Members', 'Workplace', 'Satire', 'Disney Policy'],
  },
  {
    _id: 'article-food-turkey',
    title: 'Disney Scientists Engineer Turkey Leg That Contains Entire Day\'s Nutrition',
    slug: 'disney-scientists-engineer-turkey-leg-entire-days-nutrition',
    category: 'cat-food',
    excerpt: "After years of secret research at a facility Disney calls 'The Flavor Lab,' scientists have created a genetically modified turkey leg that contains 100% of a guest's daily nutritional needs, eliminating the need to eat anything else during a park visit.",
    body: [
      richBlock('b1', [
        span('s1', 'After years of secret research at a facility Disney calls '),
        span('s2', '"The Flavor Lab,"', ['em']),
        span('s3', ' scientists have created a genetically modified turkey leg that contains 100% of a guest\'s daily nutritional needs. The '),
        span('s4', 'Super Turkey Leg™', ['strong']),
        span('s5', ' eliminates the need to eat anything else during a 14-hour park visit, which Disney estimates will save the average family approximately $340 in food costs per day.'),
      ]),
      block('b2', 'The Science Behind the Super Leg', 'h2'),
      block('b3', 'The Super Turkey Leg™ was developed by a team of 14 food scientists, 3 geneticists, and one Imagineer who "just really likes turkey legs." The leg contains engineered pockets of vitamins, minerals, electrolytes, and what Disney describes as "a proprietary blend of pixie dust and protein." Each leg weighs approximately 3.7 pounds and comes with its own carrying harness.'),
      block('b4', 'Flavors and Varieties', 'h2'),
      block('b5', 'The Super Turkey Leg™ will be available in four flavors: Original Magic (smoked), EPCOT International (seasoned with spices from all 11 World Showcase countries), Galaxy\'s Edge (blue, for some reason), and "The Villain" (so spicy that guests must sign a waiver before consuming).'),
      { _type: 'block', _key: 'b6', style: 'blockquote', children: [span('s7', '"I ate one Super Turkey Leg™ at 9 AM and I didn\'t feel hungry again until I was halfway home on I-4. It also cured my jet lag and improved my credit score. Five stars." — Completely made-up taste tester')] },
      block('b7', 'The Super Turkey Leg™ will retail for $89.99, which Disney notes is "actually a bargain when you consider you won\'t need to buy seven other overpriced meals throughout the day." Annual Passholders receive a 3% discount and a commemorative turkey leg pin.'),
    ],
    tags: ['Food', 'Turkey Leg', 'Satire', 'Disney Dining'],
  },
]

async function seedArticles() {
  console.log('Seeding themed articles...\n')

  for (const article of articles) {
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
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      excerpt: article.excerpt,
      body: article.body,
      tags: article.tags,
      approvedAt: new Date().toISOString(),
      approvedBy: 'Michael Morrow',
    }

    await client.createOrReplace(doc)
    console.log(`  ✓ [${article.category.replace('cat-', '')}] ${article.title}`)
  }

  console.log(`\nDone! ${articles.length} themed articles seeded.`)
}

seedArticles().catch(console.error)
