--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CuisineType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."CuisineType" AS ENUM (
    'MIDDLE_EASTERN',
    'INDIAN_PAKISTANI',
    'TURKISH',
    'PERSIAN',
    'MEDITERRANEAN',
    'AFGHAN',
    'CAFE',
    'OTHER',
    'MEXICAN',
    'CHINESE',
    'THAI',
    'FAST_FOOD'
);


ALTER TYPE public."CuisineType" OWNER TO neondb_owner;

--
-- Name: PriceRange; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."PriceRange" AS ENUM (
    '$',
    '$$',
    '$$$'
);


ALTER TYPE public."PriceRange" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Backup; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Backup" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    filename text NOT NULL,
    size integer NOT NULL,
    status text NOT NULL,
    error text
);


ALTER TABLE public."Backup" OWNER TO neondb_owner;

--
-- Name: Brand; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Brand" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."Brand" OWNER TO neondb_owner;

--
-- Name: BugReport; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."BugReport" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "stepsToReproduce" text,
    "expectedBehavior" text,
    "actualBehavior" text,
    browser text,
    device text,
    email text,
    "screenshotUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BugReport" OWNER TO neondb_owner;

--
-- Name: Comment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    content text NOT NULL,
    rating integer DEFAULT 5 NOT NULL,
    "authorName" text NOT NULL,
    "restaurantId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imageUrl" text
);


ALTER TABLE public."Comment" OWNER TO neondb_owner;

--
-- Name: Report; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Report" (
    id text NOT NULL,
    "restaurantId" text NOT NULL,
    details text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "resolvedAt" timestamp(3) without time zone,
    "resolvedBy" text
);


ALTER TABLE public."Report" OWNER TO neondb_owner;

--
-- Name: Restaurant; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Restaurant" (
    id text NOT NULL,
    name text NOT NULL,
    "cuisineType" public."CuisineType" NOT NULL,
    address text NOT NULL,
    description text,
    "priceRange" public."PriceRange" NOT NULL,
    "hasPrayerRoom" boolean DEFAULT false NOT NULL,
    "hasOutdoorSeating" boolean DEFAULT false NOT NULL,
    "isZabiha" boolean DEFAULT false NOT NULL,
    "hasHighChair" boolean DEFAULT false NOT NULL,
    "servesAlcohol" boolean DEFAULT false NOT NULL,
    "isFullyHalal" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "imageUrl" text,
    "zabihaBeef" boolean DEFAULT false NOT NULL,
    "zabihaChicken" boolean DEFAULT false NOT NULL,
    "zabihaGoat" boolean DEFAULT false NOT NULL,
    "zabihaLamb" boolean DEFAULT false NOT NULL,
    "zabihaVerified" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    "zabihaVerifiedBy" text,
    "brandId" text
);


ALTER TABLE public."Restaurant" OWNER TO neondb_owner;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- Data for Name: Backup; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Backup" (id, "createdAt", filename, size, status, error) FROM stdin;
\.


--
-- Data for Name: Brand; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Brand" (id, name) FROM stdin;
\.


--
-- Data for Name: BugReport; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."BugReport" (id, title, description, "stepsToReproduce", "expectedBehavior", "actualBehavior", browser, device, email, "screenshotUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Comment" (id, content, rating, "authorName", "restaurantId", "createdAt", "updatedAt", "imageUrl") FROM stdin;
cma4h2oi80001jr04kc6zwl3e	Is this halal? 	5	Anji	hitgwd1geihafe771s4qu3ss	2025-04-30 21:52:56.721	2025-04-30 21:52:56.721	\N
cma4izv2l0003jr04wr2uajvk	Excellent coffee shop with superb customer service! Highly recommend. It does get busy on the weekend/ramadan but they seem to manage well with the crowd. 	5	Bintou 	d4b91eh101m7ha2nf86s6twh	2025-04-30 22:46:44.493	2025-04-30 22:46:44.493	\N
cma4mn4gw0001js04ndfpa3tf	We have all handcut halal chicken and beef.	5	Mudassir uddin	fofpgc5xjk9gjksm6jrlryu9	2025-05-01 00:28:48.594	2025-05-01 00:28:48.594	\N
\.


--
-- Data for Name: Report; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Report" (id, "restaurantId", details, status, "createdAt", "updatedAt", "resolvedAt", "resolvedBy") FROM stdin;
\.


--
-- Data for Name: Restaurant; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Restaurant" (id, name, "cuisineType", address, description, "priceRange", "hasPrayerRoom", "hasOutdoorSeating", "isZabiha", "hasHighChair", "servesAlcohol", "isFullyHalal", "createdAt", "updatedAt", "imageUrl", "zabihaBeef", "zabihaChicken", "zabihaGoat", "zabihaLamb", "zabihaVerified", "zabihaVerifiedBy", "brandId") FROM stdin;
qlanyj87rl7pdjpx5jq0gybq	Kimchi Red - Alpharetta	OTHER	3630 Old Milton Pkwy #110, Alpharetta, GA 30005	Authentic Korean halal restaurant serving a variety of Korean dishes including bulgogi, bibimbap, and their signature kimchi dishes.	$$	f	f	f	t	t	f	2025-04-25 01:51:15.963	2025-04-30 19:10:48.435	/images/logo.png	f	f	f	f	\N	\N	\N
gjw5e78xgfev5w514bxopnu6	Olomi's Grill	AFGHAN	11670 Jones Bridge Rd suite a, Johns Creek, GA 30005	Traditional Afghan cuisine featuring kabobs, rice dishes, and freshly baked naan. Known for their authentic flavors and warm hospitality.	$	f	t	f	t	f	t	2025-04-25 01:51:16.176	2025-04-30 19:10:48.477	/images/logo.png	f	f	f	f	\N	\N	\N
hsck2i1dw8o3tqeer0hu0tx1	Spices Hut Food Court	INDIAN_PAKISTANI	4150 Old Milton Pkwy #134, Alpharetta, GA 30005	A vibrant food court offering a diverse selection of Indian and Pakistani dishes. Known for their street food, chaat, and authentic regional specialties.	$	f	f	t	f	f	t	2025-04-25 01:51:16.387	2025-04-30 19:10:48.519	/images/logo.png	f	f	f	f	\N	\N	\N
p5epalto5e00vre66nqhhrnm	Pista House Alpharetta	INDIAN_PAKISTANI	5530 Windward Pkwy, Alpharetta, GA 30004	Famous for their Hyderabadi biryani and Indian cuisine. Offers a wide variety of vegetarian and non-vegetarian dishes, known for authentic flavors and generous portions.	$	f	t	t	t	f	t	2025-04-25 01:51:16.593	2025-04-30 19:10:48.563	/images/logo.png	f	f	f	f	\N	\N	\N
ej0gw6x2565a8qrd37f2h7fg	Namak	INDIAN_PAKISTANI	5220 McGinnis Ferry Rd, Alpharetta, GA 30005	Modern Indian dining experience offering innovative takes on traditional dishes. Known for their sophisticated ambiance and contemporary interpretation of classic flavors.	$$$	f	t	t	t	f	t	2025-04-25 01:51:16.8	2025-04-30 19:10:48.607	/images/logo.png	f	f	f	f	\N	\N	\N
auvxwwjkktnzhc1u8f1wrnjg	Al Zein Shawarma & Mediterranean Grill	MIDDLE_EASTERN	11875 Jones Bridge Rd Suite F, Alpharetta, GA 30005	Authentic Mediterranean and Middle Eastern cuisine featuring fresh shawarma, falafel, and grilled specialties. Known for their generous portions and homemade sauces.	$$	f	t	f	t	f	t	2025-04-25 01:51:17.217	2025-04-30 19:10:48.689	/images/logo.png	f	f	f	f	\N	\N	\N
ia3j8bsx9mcuucdy62r8dwsv	Kimchi Red - Johns Creek	OTHER	3651 Peachtree Pkwy Suite D, Suwanee, GA 30024	Authentic Korean halal cuisine offering a delightful mix of traditional Korean dishes with a halal twist. Famous for their Korean BBQ and signature kimchi dishes.	$$	f	f	f	t	t	f	2025-04-25 01:51:17.443	2025-04-30 19:10:48.733	/images/logo.png	f	f	f	f	\N	\N	\N
pb5351ryk4cg5j58h66q9427	Cafe Efendi Mediterranean Restaurant	MEDITERRANEAN	488 N Main St, Alpharetta, GA 30009	Elegant Mediterranean dining featuring Turkish and Mediterranean specialties. Known for their authentic dishes, fresh ingredients, and warm hospitality.	$$$	f	f	f	t	t	f	2025-04-25 01:51:17.666	2025-04-30 19:10:48.778	/images/logo.png	f	f	f	f	\N	\N	\N
avhfxkhx4fa2jbkrszc6mnwj	Karachi Broast & Grill	INDIAN_PAKISTANI	11235 Alpharetta Hwy #140, Roswell, GA 30076	Authentic Pakistani cuisine specializing in broasted chicken and traditional grilled items. Famous for their unique spice blends and authentic flavors.	$	t	t	t	t	f	t	2025-04-25 01:51:17.88	2025-04-30 19:10:48.821	/images/logo.png	f	f	f	f	\N	\N	\N
ltqxfnpcmob8nlydrdwltghi	Zyka: The Taste | Indian Restaurant | Decatur	INDIAN_PAKISTANI	1677 Scott Blvd, Decatur, GA 30033	A Decatur institution serving authentic Indian cuisine since 1997. Known for their signature dishes, fresh tandoor items, and extensive vegetarian options.	$	f	f	t	t	f	t	2025-04-25 01:51:18.086	2025-04-30 19:10:48.864	/images/logo.png	f	f	f	f	\N	\N	\N
qfwaphh7bx8gsbnh0isds84a	The Halal Guys	MIDDLE_EASTERN	4929 Buford Hwy NE, Chamblee, GA 30341	Famous New York-based halal food chain known for their platters, gyros, and signature white sauce. Serving generous portions of Middle Eastern and Mediterranean favorites.	$	f	f	f	t	f	t	2025-04-25 01:51:18.303	2025-04-30 19:10:48.909	/images/logo.png	f	f	f	f	\N	\N	\N
i2dydijbqy9cft8rznar4ll6	Khan's Kitchen	INDIAN_PAKISTANI	5310 Windward Pkwy suite d, Alpharetta, GA 30004	Family-owned restaurant serving authentic Indian and Pakistani cuisine. Known for their fresh, made-to-order dishes and traditional recipes passed down through generations.	$$	f	f	t	t	f	t	2025-04-25 01:51:18.519	2025-04-30 19:10:48.955	/images/logo.png	f	f	f	f	\N	\N	\N
xbu0ma8i9rbg6yp4noe67mav	Shibam Coffee	CAFE	4000 North Point Pkwy Suite #900, Alpharetta, GA 30022	A cozy Muslim-owned coffee shop offering specialty coffee drinks, teas, and light refreshments in a welcoming atmosphere. Perfect spot for work, study, or casual meetups.	$$	t	f	f	f	f	t	2025-04-25 01:51:18.731	2025-04-30 19:10:49.002	/images/logo.png	f	f	f	f	\N	\N	\N
fofpgc5xjk9gjksm6jrlryu9	MOTW Coffee and Pastries	CAFE	5202 McGinnis Ferry Rd, Alpharetta, GA 30005	Modern coffee shop serving artisanal coffee and freshly baked pastries. Known for their unique blend of traditional and contemporary flavors, creating a perfect fusion of taste and ambiance.	$$	t	f	t	t	f	t	2025-04-25 01:51:18.941	2025-04-30 19:10:49.049	/images/logo.png	f	f	f	f	\N	\N	\N
d4b91eh101m7ha2nf86s6twh	967 Coffee Co	CAFE	11235 Alpharetta Hwy Suite 136, Roswell, GA 30076	A community-focused coffee shop offering premium coffee beverages, fresh pastries, and a warm, inviting space. Perfect for coffee enthusiasts seeking quality brews in a relaxed setting.	$	f	t	t	t	f	t	2025-04-25 01:51:19.161	2025-04-30 19:10:49.094	/images/logo.png	f	f	f	f	\N	\N	\N
gqm57hpeoao9q3l4u0g31ci6	Jerusalem Bakery & Grill	MIDDLE_EASTERN	11235 Alpharetta Hwy, Roswell, GA 30076	Authentic Middle Eastern bakery and restaurant known for their fresh pita bread, manakeesh, and traditional Middle Eastern dishes. Features an extensive bakery selection with fresh pastries, bread, and groceries.	$	f	f	t	f	f	t	2025-04-25 01:51:20.447	2025-04-30 19:10:49.185	/images/logo.png	f	f	f	f	\N	\N	\N
luuump8emg3trgahry09ahde	Bismillah Cafe	INDIAN_PAKISTANI	4022 Buford Hwy NE, Atlanta, GA 30345	Popular spot for authentic Pakistani street food and traditional dishes. Known for their chai, paratha rolls, and authentic South Asian breakfast items.	$	f	f	t	f	f	t	2025-04-25 01:51:20.663	2025-04-30 19:10:49.231	/images/logo.png	f	f	f	f	\N	\N	\N
t2fmvnut2eruub0hqezbt6z5	Merhaba Shawarma	MEDITERRANEAN	4188 E Ponce de Leon Ave, Clarkston, GA 30021	Authentic Mediterranean shawarma and kebab restaurant offering fresh, halal meats and homemade sauces.	$	f	t	t	f	f	t	2025-04-25 01:51:20.916	2025-04-30 19:10:49.283	/images/logo.png	f	f	f	f	\N	\N	\N
myhnrcs880e432xtv910gw17	Delbar - Old Milton	MIDDLE_EASTERN	4120 Old Milton Pkwy, Alpharetta, GA 30005	Modern Middle Eastern restaurant offering a fresh take on traditional dishes. Features family-style dining with an emphasis on Persian and Mediterranean flavors.	$$$	f	t	f	t	t	f	2025-04-25 01:51:21.123	2025-04-30 19:10:49.329	/images/logo.png	f	f	f	f	\N	\N	\N
u1bz4uxdoht00gwmzras46l4	Sabri Kabab House	INDIAN_PAKISTANI	6075 Singleton Rd, Norcross, GA 30093	Traditional Indian fare & sweets in a counter-serve setup with vibrant orange walls & blue booths.	$	f	f	t	t	f	t	2025-04-25 01:51:21.339	2025-04-30 19:10:49.372	/images/logo.png	f	f	f	f	\N	\N	\N
d1bgxpcnvt9hcdu8shhny9d2	Mukja Korean Fried Chicken	OTHER	933 Peachtree St NE, Atlanta, GA 30309	Modern Korean restaurant specializing in Korean-style fried chicken with halal options. Known for their crispy double-fried chicken with various sauce options including soy garlic, sweet spicy, and honey butter. Also serves Korean fusion dishes and traditional sides.	$$	f	f	f	t	f	f	2025-04-25 01:51:19.592	2025-04-30 19:10:50.188	/images/logo.png	f	f	f	f	\N	\N	\N
ea0wcdwaq88szsioue1d1ed5	Dantanna's	OTHER	3400 Around Lenox Rd NE #304, Atlanta, GA 30326	Upscale sports restaurant offering halal steaks and seafood. Known for their premium cuts of halal beef, fresh seafood selections, and sophisticated atmosphere. Features a diverse menu including gourmet burgers, fresh salads, and signature dishes.	$$$	f	f	t	t	t	f	2025-04-25 01:51:20.232	2025-04-30 19:10:50.332	/images/logo.png	f	f	f	f	\N	\N	\N
s9b9bdw26i8x7ixbhijvn816	ZamZam Halal Supermarket & Restaurant	INDIAN_PAKISTANI	5432 Buford Hwy NE, Doraville, GA 30340	Authentic Pakistani and Indian cuisine serving traditional dishes. Known for their biryani, kebabs, and fresh naan bread.	$	t	f	t	f	f	t	2025-04-25 01:51:21.768	2025-04-30 19:10:49.458	/images/logo.png	f	f	f	f	\N	\N	\N
abxzev8844ldsjglzybjxnjq	Kabul Kabob	AFGHAN	1475 Holcomb Bridge Rd, Roswell, GA 30076	Afghan restaurant specializing in authentic kabobs, rice dishes, and traditional Afghan cuisine. Features fresh-baked Afghan bread.	$$	f	f	t	t	f	t	2025-04-25 01:51:21.986	2025-04-30 19:10:49.506	/images/logo.png	f	f	f	f	\N	\N	\N
w9t5t8f5te57ulqq84s55mrx	Al Madina Grocery & Restaurant	MIDDLE_EASTERN	5345 Jimmy Carter Blvd suite c, Norcross, GA 30093	Middle Eastern restaurant and grocery store serving fresh shawarma, falafel, and grilled items. Features an in-house bakery and grocery section.	$	t	f	t	f	f	t	2025-04-25 01:51:22.2	2025-04-30 19:10:49.548	/images/logo.png	f	f	f	f	\N	\N	\N
kgvxne5egzawojotw0zdsnjw	Chinese Dhaba	CHINESE	5675 Jimmy Carter Blvd, Norcross, GA 30071	Chinese halal restaurant serving authentic Chinese cuisine made with halal ingredients. Known for their hand-pulled noodles and lamb dishes.	$	f	f	t	t	f	t	2025-04-25 01:51:22.42	2025-04-30 19:10:49.593	/images/logo.png	f	f	f	f	\N	\N	\N
obwine1cw1161rvioz20fwkw	Star Pizza	FAST_FOOD	11490 Alpharetta Highway, Roswell, GA	Italian pizza restaurant serving halal options. Known for their pizza varieties and Italian specialties.	$$	f	f	t	f	f	t	2025-04-25 01:51:22.635	2025-04-30 19:10:49.641	/images/logo.png	f	f	f	f	\N	\N	\N
k2v1y7uviu46yns66rpjf436	PONKO Chicken - Alpharetta	FAST_FOOD	220 South Main Street, Alpharetta, GA	Japanese-American fusion restaurant specializing in halal chicken tenders with unique Asian-inspired sauces. Known for their crispy chicken and signature PONKO sauce.	$	f	t	f	t	t	f	2025-04-25 01:51:22.854	2025-04-30 19:10:49.685	/images/logo.png	f	f	f	f	\N	\N	\N
e57svvgmi2rxapoleciqv371	Moctezuma Mexican Grill	MEXICAN	13020 Morris Road, Alpharetta, GA	Mexican restaurant offering halal options. Features authentic Mexican dishes and specialties made with halal meats.	$$	f	f	t	t	t	f	2025-04-25 01:51:23.347	2025-04-30 19:10:49.777	/images/logo.png	f	f	f	f	\N	\N	\N
o3aj1qrmhgay3nq9in10d41p	Adana Mediterranean Grill	MEDITERRANEAN	585 Franklin Gateway Southeast, unit B-3, Marietta, GA 30067	A Turkish and Greek spot with an entirely halal menu. Choose from a selection of mezze, grilled meats, and baked foods. The adana kebap, made with ground beef and lamb, is among the best around.	$$	t	t	t	t	f	t	2025-04-25 01:51:23.582	2025-04-30 19:10:49.821	/images/logo.png	f	f	f	f	\N	\N	\N
m2qcdxhx6g03eb9rxdxgj2to	Dil Bahar Cafe & Market	INDIAN_PAKISTANI	5825 Glenridge Drive Northeast, Sandy Springs, GA 30328	Beloved local Pakistani bakery cafe serving Karachi-style chaat, Masala fries, panipuri, and samosas. Try the chicken roll, bun kabab, or kachori with sabzi. Features desserts like shahi tukray and refreshing falooda.	$	t	f	t	t	f	t	2025-04-25 01:51:23.829	2025-04-30 19:10:49.911	/images/logo.png	f	f	f	f	\N	\N	\N
wn7w4zfe80773insijhqrxr7	Briskfire BBQ	OTHER	900 Indian Trail Lilburn Road Northwest, Lilburn, GA 30047	A unique halal barbecue spot offering beef brisket and short ribs. The Lilburn restaurant is completely halal and has a robust selection of burgers, sandwiches, and smoked meats.	$$	f	t	t	t	f	t	2025-04-25 01:51:24.039	2025-04-30 19:10:49.957	/images/logo.png	f	f	f	f	\N	\N	\N
raxgohzj2q3yp0c13wvfem1d	Stone Creek Halal Pizza	FAST_FOOD	5330 Lilburn Stone Mountain Rd #108, Lilburn, GA 30047	The best bet for halal pizza, subs, and wings in metro Atlanta. Try their signature spicy tandoori chicken pizza topped with green peppers, onions, and mozzarella.	$	f	f	t	f	f	t	2025-04-25 01:51:24.25	2025-04-30 19:10:50.005	/images/logo.png	f	f	f	f	\N	\N	\N
iuzu4msmk7vmwm7o3yd6e1zk	Salsa Taqueria & Wings	MEXICAN	3799 Buford Hwy NE, Brookhaven, GA 30329	A counter-service taqueria serving a halal menu of Mexican-American comfort foods, including beef and chicken birria tacos, tamales, wings, tortas, and burgers. Features special weekend menu items.	$	f	t	t	t	f	t	2025-04-25 01:51:24.469	2025-04-30 19:10:50.048	/images/logo.png	f	f	f	f	\N	\N	\N
s14ngdgrzdzzg72ecga5vrom	Auntie Vees Kitchen	OTHER	209 Edgewood Avenue Northeast, Atlanta, GA 30303	A fusion of soul food classics and Caribbean flavors in halal dishes. Famous for jerk chicken fried rice, oxtail dinner, and specialty mac and cheese bowls like the Kamalee with jerk chicken and house sauce.	$$	f	t	t	t	f	t	2025-04-25 01:51:24.683	2025-04-30 19:10:50.091	/images/logo.png	f	f	f	f	\N	\N	\N
usfzcykhk894xr3op61pujid	Springreens at Community Cafe	CAFE	566 Fayetteville Rd SE, Atlanta, GA 30316	A cafe near East Lake Golf Club serving halal Southern comfort foods. Features chicken plates with black eyed peas, turkey meatloaf, halal burgers, seafood gumbo, and daily hot bar specials.	$	f	t	t	t	f	t	2025-04-25 01:51:24.912	2025-04-30 19:10:50.137	/images/logo.png	f	f	f	f	\N	\N	\N
cma0i9d1u0000i804h1ljcmw3	Talkin' Tacos Buckhead	MEXICAN	2625 Piedmont Rd NE Ste 34A, Atlanta, GA 30324	Known for Taco, Rice Bowl, Refried Beans, Burritos, Shrimp, Quesadilla, Carne Asada Tacos, Taco Salad, Nachos, Birria Tacos, Mexican Food, Tres Leches Cake, Churros, and Pico De Gallo and Chips	$	f	f	f	t	f	t	2025-04-28 03:15:03.378	2025-04-30 19:10:50.429	/images/logo.png	f	f	f	f	\N	\N	\N
cma0idwf50001i804si4jw1ox	Ariana Kabob House	AFGHAN	2870 Peachtree Industrial Blvd, Duluth, GA 30097	Authentic Afghan restaurant specializing in traditional kabobs, rice dishes, and Afghan specialties. Known for their quality meats and generous portions.	$$	f	f	f	t	f	t	2025-04-28 03:18:35.105	2025-04-30 19:10:50.474	/images/logo.png	f	f	f	f	\N	\N	\N
cma0igkyn0002i804dsis87ec	Hyderabad House Atlanta - Biryani Place	INDIAN_PAKISTANI	130 Perimeter Center Pl, Dunwoody, GA 30346	Authentic Hyderabadi restaurant specializing in various styles of biryani and Indian cuisine. Known for their traditional recipes and flavorful dishes.	$$	f	f	t	t	f	t	2025-04-28 03:20:40.223	2025-04-30 19:10:50.519	/images/logo.png	f	f	f	f	\N	\N	\N
cma0ii56x0003i804w4jfvb19	Asma's Cuisine	INDIAN_PAKISTANI	3099 Breckinridge Blvd #114b, Duluth, GA 30096	Family-owned restaurant serving authentic Pakistani and Indian dishes. Known for their home-style cooking and traditional recipes.	$	f	f	t	t	f	t	2025-04-28 03:21:53.098	2025-04-30 19:10:50.564	/images/logo.png	f	f	f	f	\N	\N	\N
ebfkqx0ztcguhcbvbn36pyar	Three Buddies	FAST_FOOD	4966 Buford Hwy NE, Chamblee, GA 30341	Quality fresh food at a resonable price. Offers burgers, sandwiches, wings, nachos, and more.	$	f	f	t	t	f	t	2025-04-29 19:31:03.302	2025-04-30 19:10:50.613	/images/logo.png	f	f	f	f	\N	\N	\N
m2wkadtc1hixkzflydkixy34	Alif Cafe	OTHER	4301 Buford Hwy NE, Atlanta, GA 30345		$	f	f	t	f	f	t	2025-04-29 19:31:03.531	2025-04-30 19:10:50.655	/images/logo.png	f	f	f	f	\N	\N	\N
ovv3atmudf3vq5yn3kxoqsh4	NaanStop	INDIAN_PAKISTANI	64 Broad St NW, Atlanta, GA 30303		$	f	f	t	f	f	f	2025-04-29 19:31:03.758	2025-04-30 19:10:50.697	/images/logo.png	f	f	f	f	\N	\N	\N
a2kx2j9nf6nvuhf5umkave0d	Mashawi Mediterranean	MEDITERRANEAN	850 Mansell Rd, Roswell, GA 30076		$$$	f	f	f	t	t	f	2025-04-29 19:31:03.976	2025-04-30 19:10:50.74	/images/logo.png	f	f	f	f	\N	\N	\N
cma2z7x2x0000k204k93gghqc	Laghman Express	OTHER	3070 Windward Plaza x1, Alpharetta, GA 30005, USA		$$	f	t	f	t	f	t	2025-04-29 20:45:21.848	2025-04-30 19:10:50.783	/images/logo.png	f	f	f	f	\N	\N	\N
hlhnhb0du0zvlohx1al3n5kb	Shawarma Press - Johns Creek	MIDDLE_EASTERN	11035 Medlock Bridge Rd #50, Johns Creek, GA 30097	The go-to place for authentic and innovative shawarma, a symbol of modern, fast, fresh, and tasty Mediterranean Eatery offering flavorful Shawarma and Mediterranean food using premium beef, all-natural chicken and made from scratch falafels and Hummus!	$	f	t	t	t	f	t	2025-04-25 01:51:15.631	2025-04-30 19:10:48.334	/images/logo.png	f	f	f	f	\N	\N	\N
d894hg6lgnp13rhqo6pavzkk	Biryani House Atlanta	INDIAN_PAKISTANI	3455 Peachtree Pkwy #201, Suwanee, GA 30024	Specializing in authentic biryani dishes from various regions of India. Offering a wide variety of flavorful rice dishes, curries, and traditional Indian specialties.	$$	f	f	t	t	f	t	2025-04-25 01:51:17.007	2025-04-30 19:10:48.648	/images/logo.png	f	f	f	f	\N	\N	\N
ru7gvfabioklckl5fafhdwmy	Baladi Coffee	CAFE	3061 George Busbee Pkwy NW suite 2000, Kennesaw, GA 30144	Experience authentic Middle Eastern coffee culture with a modern twist. Serving specialty Arabic coffee, traditional treats, and contemporary cafe favorites in a welcoming environment.	$	f	f	f	t	f	t	2025-04-25 01:51:19.373	2025-04-30 19:10:49.14	/images/logo.png	f	f	f	f	\N	\N	\N
jv40ht0w4i3iwl0k1qoisg78	Al-Amin Supermarket & Restaurant	INDIAN_PAKISTANI	5466 Buford Hwy NE, Doraville, GA 30340	Family-owned Bangladeshi and Indian restaurant serving authentic dishes. Known for their biryani, curries, and fresh tandoor items.	$	f	f	t	f	f	t	2025-04-25 01:51:21.558	2025-04-30 19:10:49.413	/images/logo.png	f	f	f	f	\N	\N	\N
lghq9yta38qftw6o01b52adx	Express Burger & Grill	MEDITERRANEAN	7291 North Point Parkway, Alpharetta, GA	Mediterranean fusion restaurant offering halal burgers, grilled specialties, and Mediterranean favorites. Known for their fresh ingredients and generous portions.	$$	f	t	t	t	f	t	2025-04-25 01:51:23.125	2025-04-30 19:10:49.732	/images/logo.png	f	f	f	f	\N	\N	\N
fxh698lopknx3h95aymxywdl	Baraka Shawarma Atlanta	MIDDLE_EASTERN	68 Walton St NW, Atlanta, GA 30303	Downtown Atlanta's premier halal shawarma spot, offering authentic Middle Eastern street food. Famous for their freshly carved shawarma wraps, platters, and homemade sauces. Features a selection of falafel, hummus, and traditional Middle Eastern sides.	$	f	f	f	f	f	t	2025-04-25 01:51:19.814	2025-04-30 19:10:50.239	/images/logo.png	f	f	f	f	\N	\N	\N
hitgwd1geihafe771s4qu3ss	Botiwalla by Chai Pani	INDIAN_PAKISTANI	Ponce City Market, 675 Ponce De Leon Ave NE n134, Atlanta, GA 30308	Modern Indian street food restaurant in Ponce City Market. Specializes in grilled kababs, rolls, and chaat with halal meat options. Features a creative menu inspired by Indian street food vendors and tea houses, known for their SPDP (Sev Potato Dahi Puri) and chicken tikka roll.	$	f	t	f	t	t	f	2025-04-25 01:51:20.021	2025-04-30 19:10:50.283	/images/logo.png	f	f	f	f	\N	\N	\N
aj1hcvyhoggq3hadqxdxzwde	Jaffa Restaurant Atl (Halal)	MEDITERRANEAN	10684 Alpharetta Hwy #500, Roswell, GA 30076	The Jaffa Restaurant may be a new spot but is backed by veteran restaurateurs behind Atlanta's Mediterranean and Middle Eastern food scene. It is a family-owned and operated restaurant aiming to bring nothing but the best to the table.	$	f	t	f	t	f	t	2025-04-29 19:31:02.034	2025-04-30 19:10:50.379	/images/logo.png	f	f	f	f	\N	\N	\N
afbayidhp2d193blk1qlfjfu	Kabob Land	MIDDLE_EASTERN	3137 Piedmont Rd NE, Atlanta, GA 30305		$	f	f	f	f	t	f	2025-04-30 19:10:50.827	2025-04-30 19:10:50.827	/images/logo.png	f	f	f	f	\N	\N	\N
utz5m4epxdkt32owxl9ihblv	Ali N' One Zabiha Halal Kitchen	FAST_FOOD	5382 Buford Hwy NE, Doraville, GA 30340		$	f	f	t	f	f	t	2025-04-30 19:10:50.888	2025-04-30 19:10:50.888	/images/logo.png	f	f	f	f	\N	\N	\N
o8kzckb725vz1wco5ua12dpa	Nature Village Restaurant	MIDDLE_EASTERN	302 Satellite Blvd NE STE 125, Suwanee, GA 30024		$$	f	f	f	f	f	t	2025-04-30 19:10:50.933	2025-04-30 19:10:50.933	/images/logo.png	f	f	f	f	\N	\N	\N
tld1fshpy233idkabxrg0b1m	Halal Pizza and cafe	FAST_FOOD	420 N Indian Creek Dr, Clarkston, GA 30021		$	f	f	f	f	f	t	2025-04-30 19:10:50.974	2025-04-30 19:10:50.974	/images/logo.png	f	f	f	f	\N	\N	\N
l9sihkjn3nkzgdt8e2dwtkow	Bawarchi Biryanis Atlanta	MIDDLE_EASTERN	6627-A Roswell Rd NE, Sandy Springs, GA 30328		$	f	t	f	t	f	t	2025-04-30 19:10:51.017	2025-04-30 19:10:51.017	/images/logo.png	f	f	f	f	\N	\N	\N
g0dtzaodjk3d85ky4cv1agx6	Shah's Halal Food	FAST_FOOD	5450 Peachtree Pkwy NW, Peachtree Corners, GA 30092		$	f	f	f	t	f	t	2025-04-30 19:10:51.061	2025-04-30 19:10:51.061	/images/logo.png	f	f	f	f	\N	\N	\N
p3x3af7bkk2wc5p3eixtsenu	Lahore Grill	INDIAN_PAKISTANI	1869 Cobb Pkwy Suite#150, Marietta, GA 30060		$	f	f	f	t	f	t	2025-04-30 19:10:51.103	2025-04-30 19:10:51.103	/images/logo.png	f	f	f	f	\N	\N	\N
tzyon0i35a2eqpq8jl5dpm91	AZ Pizza, Wings & Fish (Halal)	FAST_FOOD	855 S Cobb Dr SE, Marietta, GA 30060		$	f	f	f	t	f	t	2025-04-30 19:10:51.146	2025-04-30 19:10:51.146	/images/logo.png	f	f	f	f	\N	\N	\N
r36fvyc7p47hjkul1grqpfiz	Scoville Hot Chicken - Buckhead	FAST_FOOD	3420 Piedmont Rd NE Unit B, Atlanta, GA 30305		$	f	f	f	f	f	t	2025-04-30 19:10:51.189	2025-04-30 19:10:51.189	/images/logo.png	f	f	f	f	\N	\N	\N
cma4e0xuk0000l204nnwj5omw	Bezoria Alpharetta 	MIDDLE_EASTERN	3325 Old Milton Pkwy, Alpharetta, GA 30022, USA	This family owned location offers online ordering for no wait time, a Drive-Thru pickup window, small event rooms which provide prayer space, a large dining hall, and catering.  Fully halal menu and generous portions!  Owners are active volunteers in the community. 	$	t	f	f	t	f	t	2025-04-30 20:27:36.669	2025-04-30 20:27:36.669	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746044855/halal-bites-atl/jg3m442bzsoa6jtx7ukv.jpg	f	f	f	f	\N	\N	\N
cma4nuz1r0000l804nexgrm2s	Nara Cuisine & Lounge	MIDDLE_EASTERN	9700 Medlock Crossing Pkwy, Johns Creek, GA 30022, USA		$$	f	f	f	f	f	t	2025-05-01 01:02:54.447	2025-05-01 01:02:54.447	/images/logo.png	f	f	f	f	\N	\N	\N
cma4pkjpx0000ji04n2vzqssz	Mokhaport	CAFE	1861 Mountain Industrial Blvd suite 106 a, Tucker, GA 30084, USA		$	f	t	f	f	f	t	2025-05-01 01:50:47.253	2025-05-01 01:50:47.253	/images/logo.png	f	f	f	f	\N	\N	\N
cma4qq0040000l404vq8vfeyw	Pizza Wali 	OTHER	797 Morrow Rd, Forest Park, GA 30297, USA		$	f	f	f	f	f	t	2025-05-01 02:23:01.253	2025-05-01 02:23:01.253	/images/logo.png	f	f	f	f	\N	\N	\N
cma59xhj00000ji0a1pno856m	Murrays In A Hurry	OTHER	3940 Peachtree Industrial Blvd, Duluth, GA 30096, USA		$	t	t	f	t	f	t	2025-05-01 11:20:43.26	2025-05-01 11:20:43.26	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746098441/halal-bites-atl/smwic7xnrlxatpzzcuhv.jpg	f	f	f	f	\N	\N	\N
cma5f62k80000l404s6dcbk26	Biryani Pot	INDIAN_PAKISTANI	5805 State Bridge Rd, Duluth, GA 30097, USA		$$	f	f	f	f	t	t	2025-05-01 13:47:21.848	2025-05-01 13:47:21.848	/images/logo.png	f	f	f	f	\N	\N	\N
cma4o66o10001l804xqf6vq59	Wowbõõza	MIDDLE_EASTERN	1630 Pleasant Hill Rd #170, Duluth, GA 30096	Mediterranean ice cream and desserts\nKunafa baklava 	$	f	t	f	t	f	t	2025-05-01 01:11:37.537	2025-05-01 01:11:37.537	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746061896/halal-bites-atl/jpumckhj5nj4nvqss0qp.jpg	f	f	f	f	\N	\N	\N
cma5n4d240000l804ib30xuit	BaBa’s Wings & Platters	MEDITERRANEAN	706 Grayson Hwy suite 211, Lawrenceville, GA 30046, USA		$	f	f	f	f	f	f	2025-05-01 17:29:59.068	2025-05-01 17:29:59.068	/images/logo.png	f	f	f	f	\N	\N	\N
cma61r4oy0000jm04j7ofa68h	Buzzin Burgers	OTHER	440 Ernest W Barrett Pkwy NW Suite 16, Kennesaw, GA 30144		$	f	f	f	f	f	t	2025-05-02 00:19:35.937	2025-05-02 00:19:35.937	/images/logo.png	f	f	f	f	\N	\N	\N
cma66qz9w0000jr04h0e3qwvx	Shalimar Kabab House	INDIAN_PAKISTANI	4760 Lawrenceville Hwy, Suit B-4		$$	f	f	f	f	f	t	2025-05-02 02:39:26.997	2025-05-02 02:39:26.997	/images/logo.png	f	f	f	f	\N	\N	\N
cma69eg0y0000la04oo1zlb6k	Bezoria- Duluth 	MIDDLE_EASTERN	2131 Pleasant Hill Rd Suite 153, Duluth, GA 30096	Shawarma you waiting for? Bezoria's got shawarma , falafel , hummus, bowls, & more! Tasty | Healthy | Halal | Cumberland | Duluth | Alpharetta.	$	f	f	f	f	f	t	2025-05-02 03:53:41.026	2025-05-02 03:53:41.026	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746158019/halal-bites-atl/eyxnj3l8pndqdeuaxzfx.jpg	f	f	f	f	\N	\N	\N
cma69jfs10000ih04i3ezle0d	Bezoria - Cumberland 	MIDDLE_EASTERN	2860 Cumberland Mall #1101, Atlanta, GA 30339	B ezoria's got shawarma, falafel, hummus, bowls, and more. In Cumberland + Duluth + Alpharetta + N Olmsted, OH (Coming Soon)	$	f	f	f	t	f	t	2025-05-02 03:57:33.984	2025-05-02 03:57:33.984	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746158253/halal-bites-atl/gnseak1uyejkycihrapf.jpg	f	f	f	f	\N	\N	\N
cma75ww4o0000jr04qi53ma22	Talkin Tacos	MEXICAN	2625 Piedmont Rd NE	Best tacos originated in Miami \nThey have halal chicken and beef \nNot sure if chicken is handcut	$$	f	t	f	f	f	t	2025-05-02 19:03:49.416	2025-05-02 19:03:49.416	https://res.cloudinary.com/dyzzrq1qu/image/upload/v1746212627/halal-bites-atl/unwhic8nhmjhbfcjthay.png	f	f	f	f	\N	\N	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
06903bd0-6b40-4b31-b5e9-74fa75fe4f83	126be61ba7dc6a8be723e7cd6146bc94db7cf56a618e611d7e033c8c6689726b	2025-04-25 01:51:14.461604+00	20250422014053_init	\N	\N	2025-04-25 01:51:14.244369+00	1
853c7586-c862-4510-b1b9-02371817ee5c	2869d11aa4f35cd33e061e2aef99a6b6ff8df6095c5aa9b8e05c40de0e701c47	2025-04-29 18:11:38.650399+00	20250428174326_add_mexican_chinese_thai_cuisine	\N	\N	2025-04-29 18:11:38.560584+00	1
d15ffabb-a138-4caa-97c4-f8a49e127453	76edd30ff44997bd2842f3d4892b5bc90bf9618cb3713c0fb814580dbddb181c	2025-04-29 18:11:38.749755+00	20250429171349_add_restaurant_image	\N	\N	2025-04-29 18:11:38.674383+00	1
20d4fc00-d3ff-4400-a7c6-4e46b1b889f9	e150d16aa26ddc876019978e1fc97323c1e4f2e9a4f321ba522a277d0fc57065	2025-04-30 19:09:03.754026+00	20250430170145_add_fast_food_cuisine	\N	\N	2025-04-30 19:09:03.633236+00	1
28424d50-e3b9-490d-b187-35212487a714	005f4782519cb5b24e29919169a981f6fc179312db4326f999f047beba5d4f47	2025-05-01 18:59:47.281015+00	20250430233843_add_detailed_zabiha_fields	\N	\N	2025-05-01 18:59:47.18408+00	1
fbe7af9b-1861-4a89-8aeb-0e054369139e	5d7e278fdf9a20795a64c7944cade023c35943da3c00c5a2ad51075709e8d28f	2025-05-01 18:59:47.400759+00	20250501155619_add_backup_table	\N	\N	2025-05-01 18:59:47.307602+00	1
ae22e52b-e650-4242-a951-8e6879cca918	f8103f281a12e56d34ed5fb2e844796b30b6bd80d1ca7fcd6d242f84812f90e4	2025-05-01 18:59:47.509109+00	20250501171320_add_reports_table	\N	\N	2025-05-01 18:59:47.431063+00	1
974de8cb-dcce-482d-9ff9-8b7835886c0a	d2660b9928115d09f112cec03296ebb0917a0e9256065e2142812ca363bee044	2025-05-02 17:39:08.850215+00	20250502155149_add_bug_report_table	\N	\N	2025-05-02 17:39:08.669043+00	1
86d47df8-fe3c-48c8-aa7e-1b35b00c85b1	3ae1e0250558c3fef676da98f54df8a4473624dbde5ae6eeda76b2c8077335d7	2025-05-02 17:39:08.992571+00	20250502171608_add_brand_model	\N	\N	2025-05-02 17:39:08.882554+00	1
\.


--
-- Name: Backup Backup_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Backup"
    ADD CONSTRAINT "Backup_pkey" PRIMARY KEY (id);


--
-- Name: Brand Brand_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Brand"
    ADD CONSTRAINT "Brand_pkey" PRIMARY KEY (id);


--
-- Name: BugReport BugReport_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."BugReport"
    ADD CONSTRAINT "BugReport_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: Report Report_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_pkey" PRIMARY KEY (id);


--
-- Name: Restaurant Restaurant_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Brand_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Brand_name_key" ON public."Brand" USING btree (name);


--
-- Name: Comment_restaurantId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Comment_restaurantId_idx" ON public."Comment" USING btree ("restaurantId");


--
-- Name: Report_restaurantId_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "Report_restaurantId_idx" ON public."Report" USING btree ("restaurantId");


--
-- Name: Restaurant_address_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Restaurant_address_key" ON public."Restaurant" USING btree (address);


--
-- Name: Restaurant_name_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Restaurant_name_key" ON public."Restaurant" USING btree (name);


--
-- Name: Comment Comment_restaurantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES public."Restaurant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Report Report_restaurantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Report"
    ADD CONSTRAINT "Report_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES public."Restaurant"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Restaurant Restaurant_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Restaurant"
    ADD CONSTRAINT "Restaurant_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public."Brand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

