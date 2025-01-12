--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Ubuntu 14.13-1.pgdg22.04+1)
-- Dumped by pg_dump version 14.13 (Ubuntu 14.13-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    profile_id integer NOT NULL,
    status character(20) NOT NULL,
    enrollment_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    priority integer NOT NULL,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY (ARRAY['Oczekujący'::text, 'Odrzucony'::text, 'Przyjęty'::text])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.applications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id integer NOT NULL,
    pesel character varying(11) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- Name: candidates_candidate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.candidates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.candidates_candidate_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profile_criteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_criteria (
    id integer NOT NULL,
    profile_id integer NOT NULL,
    subject_id integer NOT NULL,
    type character varying(16) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT class_criteria_type_check CHECK (((type)::text = ANY (ARRAY[('mandatory'::character varying)::text, ('alternative'::character varying)::text])))
);


ALTER TABLE public.profile_criteria OWNER TO postgres;

--
-- Name: class_criteria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.profile_criteria ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.class_criteria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    school_id integer NOT NULL,
    capacity integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- Name: classes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    round integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


ALTER TABLE public.enrollments OWNER TO postgres;

--
-- Name: enrollment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.enrollments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enrollment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grades (
    id integer NOT NULL,
    candidate_id integer NOT NULL,
    subject_id integer NOT NULL,
    grade integer NOT NULL,
    type character varying(11) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT grades_type_check CHECK (((type)::text = ANY ((ARRAY['certificate'::character varying, 'exam'::character varying])::text[])))
);


ALTER TABLE public.grades OWNER TO postgres;

--
-- Name: grades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.grades ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.grades_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: school_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_admins (
    id integer NOT NULL,
    school_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.school_admins OWNER TO postgres;

--
-- Name: school_admins_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.school_admins ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.school_admins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.schools OWNER TO postgres;

--
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.schools ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.schools_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_exam_subject boolean DEFAULT false NOT NULL
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: subjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.subjects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.subjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, candidate_id, profile_id, status, enrollment_id, created_at, updated_at, priority) FROM stdin;
50	17	1	Przyjęty            	5	2025-01-10 20:45:08.510725	2025-01-10 20:45:08.510725	1
51	17	4	Odrzucony           	5	2025-01-10 20:45:08.510725	2025-01-10 20:45:08.510725	2
28	10	1	Przyjęty            	1	2024-12-09 19:51:35.874654	2024-12-09 19:51:35.874654	2
44	15	1	Przyjęty            	5	2025-01-07 00:15:49.365747	2025-01-07 00:15:49.365747	1
34	13	1	Przyjęty            	1	2024-12-13 01:42:41.180907	2024-12-13 01:42:41.180907	2
42	16	1	Odrzucony           	5	2025-01-06 23:48:24.656004	2025-01-06 23:48:24.656004	2
41	16	2	Przyjęty            	5	2025-01-06 23:48:24.656004	2025-01-06 23:48:24.656004	1
45	15	2	Odrzucony           	5	2025-01-07 00:15:49.365747	2025-01-07 00:15:49.365747	2
35	13	2	Odrzucony           	1	2024-12-13 01:42:41.180907	2024-12-13 01:42:41.180907	3
20	3	2	Odrzucony           	1	2024-12-09 11:44:46.23502	2024-12-09 11:44:46.23502	2
26	9	2	Odrzucony           	1	2024-12-09 19:46:27.759074	2024-12-09 19:46:27.759074	2
27	9	4	Przyjęty            	1	2024-12-09 19:46:27.759074	2024-12-09 19:46:27.759074	1
46	15	4	Odrzucony           	5	2025-01-07 00:15:49.365747	2025-01-07 00:15:49.365747	3
43	16	4	Odrzucony           	5	2025-01-06 23:48:24.656004	2025-01-06 23:48:24.656004	3
21	3	4	Odrzucony           	1	2024-12-09 11:44:46.23502	2024-12-09 11:44:46.23502	4
40	14	4	Odrzucony           	1	2024-12-14 17:36:29.872007	2024-12-14 17:36:29.872007	2
39	14	3	Przyjęty            	1	2024-12-14 17:36:29.872007	2024-12-14 17:36:29.872007	1
19	3	1	Odrzucony           	1	2024-12-09 11:44:46.23502	2024-12-09 11:44:46.23502	1
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, pesel, first_name, last_name, created_at, updated_at, user_id) FROM stdin;
9	95061836491	Julia	Noczyńska	2024-12-09 18:03:16.057102	2024-12-09 18:03:16.057102	17
10	55071587484	Adam	Kowalski	2024-12-09 19:45:00.850404	2024-12-09 19:45:00.850404	17
15	90061769774	Jan	Nowak	2024-12-17 16:56:42.084984	2024-12-17 16:56:42.084984	19
17	68102321818	Agata	Nowak	2025-01-06 23:49:38.840711	2025-01-06 23:49:38.840711	19
16	00302324244	Grzegorz	Karmazyn	2024-12-18 18:11:48.479791	2024-12-18 18:11:48.479791	19
14	98102764276	Izabela	Piekarska	2024-12-13 01:41:23.421091	2024-12-13 01:41:23.421091	19
13	01211069833	Aniela	Piekarska	2024-12-13 01:40:38.104942	2024-12-13 01:40:38.104942	19
6	56113078632	Jagoda	Kowal	2024-12-02 21:12:42.415305	2024-12-02 21:12:42.415305	16
3	01262168369	Karol	Jarczewski	2024-11-16 01:42:06.913246	2024-11-16 01:42:06.913246	8
2	02241372199	Jerzy	Miłosławski	2024-11-16 00:22:57.050333	2024-11-16 00:22:57.050333	8
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, round, start_date, end_date) FROM stdin;
1	1	2024-11-27	2024-12-27
5	2	2024-12-31	2025-01-27
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, candidate_id, subject_id, grade, type, created_at, updated_at) FROM stdin;
13	3	1	3	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
14	3	1	4	exam	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
15	3	2	4	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
16	3	3	4	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
17	3	4	2	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
18	3	5	2	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
19	3	6	7	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
20	3	7	3	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
21	3	8	3	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
22	3	8	3	exam	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
23	3	11	3	certificate	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
24	3	11	3	exam	2024-11-30 23:11:34.051292	2024-11-30 23:11:34.051292
37	9	1	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
38	9	1	90	exam	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
39	9	2	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
40	9	3	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
41	9	4	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
42	9	5	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
43	9	6	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
44	9	7	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
45	9	8	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
46	9	8	90	exam	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
47	9	11	5	certificate	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
48	9	11	90	exam	2024-12-09 19:46:14.020717	2024-12-09 19:46:14.020717
49	10	1	4	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
50	10	1	80	exam	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
51	10	2	4	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
52	10	3	4	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
53	10	4	3	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
54	10	5	4	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
55	10	6	5	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
56	10	7	6	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
57	10	8	5	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
58	10	8	80	exam	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
59	10	11	6	certificate	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
60	10	11	80	exam	2024-12-09 19:52:22.853997	2024-12-09 19:52:22.853997
61	13	1	6	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
62	13	1	3	exam	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
63	13	2	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
64	13	3	3	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
65	13	4	3	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
66	13	5	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
67	13	6	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
68	13	7	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
69	13	8	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
70	13	8	22	exam	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
71	13	11	4	certificate	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
72	13	11	26	exam	2024-12-13 01:45:24.742467	2024-12-13 01:45:24.742467
73	14	1	3	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
74	14	1	100	exam	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
75	14	2	3	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
76	14	3	3	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
77	14	4	3	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
78	14	5	5	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
79	14	6	5	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
80	14	7	5	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
81	14	8	5	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
82	14	8	100	exam	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
83	14	11	5	certificate	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
84	14	11	100	exam	2024-12-13 01:48:36.286161	2024-12-13 01:48:36.286161
85	16	1	5	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
86	16	1	3	exam	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
87	16	2	5	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
88	16	3	5	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
89	16	4	4	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
90	16	5	3	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
91	16	6	5	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
92	16	7	4	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
93	16	8	4	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
94	16	8	3	exam	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
95	16	11	3	certificate	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
96	16	11	2	exam	2025-01-06 23:48:56.425938	2025-01-06 23:48:56.425938
97	15	1	6	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
98	15	1	40	exam	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
99	15	2	2	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
100	15	3	5	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
101	15	4	4	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
102	15	5	3	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
103	15	6	3	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
104	15	7	5	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
105	15	8	2	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
106	15	8	47	exam	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
107	15	11	4	certificate	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
108	15	11	68	exam	2025-01-07 00:09:41.803851	2025-01-07 00:09:41.803851
109	17	1	3	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
110	17	1	10	exam	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
111	17	2	4	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
112	17	3	5	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
113	17	4	5	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
114	17	5	3	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
115	17	6	3	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
116	17	7	2	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
117	17	8	2	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
118	17	8	50	exam	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
119	17	11	3	certificate	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
120	17	11	70	exam	2025-01-07 10:22:43.809697	2025-01-07 10:22:43.809697
\.


--
-- Data for Name: profile_criteria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_criteria (id, profile_id, subject_id, type, created_at, updated_at) FROM stdin;
37	1	3	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
38	1	2	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
39	1	1	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
41	1	4	alternative	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
42	2	4	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
43	2	5	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
44	2	6	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
45	2	1	alternative	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
46	2	8	alternative	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
51	4	7	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
52	4	8	mandatory	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
54	4	3	alternative	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
55	4	5	alternative	2024-11-17 23:25:07.073537	2024-11-17 23:25:07.073537
58	1	11	alternative	2024-11-26 00:30:03.275521	2024-11-26 00:30:03.275521
60	4	11	mandatory	2024-11-26 00:31:27.732197	2024-11-26 00:31:27.732197
61	7	8	mandatory	2024-12-18 23:02:17.054088	2024-12-18 23:02:17.054088
62	7	11	mandatory	2024-12-18 23:02:17.054088	2024-12-18 23:02:17.054088
63	7	7	mandatory	2024-12-18 23:02:17.054088	2024-12-18 23:02:17.054088
64	7	5	alternative	2024-12-18 23:02:17.054088	2024-12-18 23:02:17.054088
65	7	6	alternative	2024-12-18 23:02:17.054088	2024-12-18 23:02:17.054088
66	6	8	mandatory	2024-12-18 23:02:52.38603	2024-12-18 23:02:52.38603
67	6	11	mandatory	2024-12-18 23:02:52.38603	2024-12-18 23:02:52.38603
68	6	7	mandatory	2024-12-18 23:02:52.38603	2024-12-18 23:02:52.38603
69	6	6	alternative	2024-12-18 23:02:52.38603	2024-12-18 23:02:52.38603
70	6	1	alternative	2024-12-18 23:02:52.38603	2024-12-18 23:02:52.38603
71	3	1	mandatory	2025-01-06 23:19:06.288479	2025-01-06 23:19:06.288479
72	3	2	alternative	2025-01-06 23:19:06.288479	2025-01-06 23:19:06.288479
73	3	4	mandatory	2025-01-06 23:19:06.288479	2025-01-06 23:19:06.288479
74	3	8	mandatory	2025-01-06 23:19:06.288479	2025-01-06 23:19:06.288479
75	3	11	alternative	2025-01-06 23:19:06.288479	2025-01-06 23:19:06.288479
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, name, school_id, capacity, created_at, updated_at) FROM stdin;
1	informatyczny	1	30	2024-11-17 23:07:44.17441	2024-11-17 23:07:44.17441
2	biologiczny	1	30	2024-11-17 23:07:44.17441	2024-11-17 23:07:44.17441
4	historyczny	3	25	2024-11-17 23:07:44.17441	2024-11-17 23:07:44.17441
7	Architektoniczny	5	20	2024-12-18 20:16:01.117352	2024-12-18 20:16:01.117352
6	Lingwistyczny	5	24	2024-12-18 20:14:40.698265	2024-12-18 20:14:40.698265
3	elektryk	2	28	2024-11-17 23:07:44.17441	2024-11-17 23:07:44.17441
\.


--
-- Data for Name: school_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_admins (id, school_id, user_id, created_at, updated_at) FROM stdin;
3	5	21	2024-12-17 20:16:25.187587	2024-12-17 20:16:25.187587
5	3	21	2024-12-18 15:41:44.082691	2024-12-18 15:41:44.082691
6	1	22	2025-01-06 23:06:46.026675	2025-01-06 23:06:46.026675
7	2	22	2025-01-06 23:06:52.849813	2025-01-06 23:06:52.849813
8	6	22	2025-01-06 23:06:57.133883	2025-01-06 23:06:57.133883
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, name, created_at, updated_at) FROM stdin;
1	Technikum nr 24	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
2	Szkoła zawodowa nr 3	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
3	Liceum ogólnokształcące nr 1	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
5	Technikum nr 4	2024-12-16 21:53:55.842103	2024-12-16 21:53:55.842103
6	Liceum Ogólnokształcące nr 10	2024-12-18 15:11:41.263527	2024-12-18 15:11:41.263527
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, created_at, updated_at, is_exam_subject) FROM stdin;
1	matematyka	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	t
2	fizyka	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
3	informatyka	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
4	chemia	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
5	biologia	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
6	geografia	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
7	historia	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	f
8	język polski	2024-11-17 23:04:14.241748	2024-11-17 23:04:14.241748	t
11	język obcy nowożytny	2024-11-26 00:23:31.429125	2024-11-26 00:23:31.429125	t
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_name, created_at, updated_at) FROM stdin;
6	user	2024-09-01 22:04:18.466298	2024-09-01 22:04:18.466298
7	user	2024-09-03 16:26:41.724667	2024-09-03 16:26:41.724667
8	user	2024-09-17 00:00:05.448964	2024-09-17 00:00:05.448964
9	user	2024-09-17 01:10:14.888375	2024-09-17 01:10:14.888375
10	user	2024-10-22 00:00:58.125922	2024-10-22 00:00:58.125922
12	user	2024-11-11 18:18:43.497994	2024-11-11 18:18:43.497994
13	user	2024-11-14 00:07:49.95256	2024-11-14 00:07:49.95256
16	user	2024-12-02 21:10:10.257826	2024-12-02 21:10:10.257826
17	user	2024-12-09 14:18:00.183076	2024-12-09 14:18:00.183076
18	admin	2024-12-09 19:52:58.129178	2024-12-09 19:52:58.129178
19	user	2024-12-13 01:37:53.748459	2024-12-13 01:37:53.748459
20	user	2024-12-15 16:49:55.137041	2024-12-15 16:49:55.137041
21	schoolAdmin	2024-12-17 20:05:12.892054	2024-12-17 20:05:12.892054
22	schoolAdmin	2025-01-06 23:03:33.249066	2025-01-06 23:03:33.249066
23	user	2025-01-10 17:01:01.990898	2025-01-10 17:01:01.990898
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, updated_at) FROM stdin;
6	fajnylogin	email@email.com	$2b$12$TLSNPv9A6yuVFRB1Hjv49OnYgBd/i0e90EorKIuK16fwgqgewuiuy	2024-09-01 22:04:18.459146	2024-09-01 22:04:18.459146
7	Julia	email@email2.com	$2b$12$NGSDULDN8ia7Yf8IzlvJzuzQX4dP78BmSWcvzzHSA.0GtREjER7e.	2024-09-03 16:26:41.717646	2024-09-03 16:26:41.717646
8	fajnylogin2	email2@email.com	$2b$12$JT3WNRcGsMSr.2QIWQNvG.hBT4mQzxZdzNuFYOupm8VZ7tauRzIPK	2024-09-17 00:00:05.448964	2024-09-17 00:00:05.448964
9	fajnylogin3	email@email3.com	$2b$12$i1WJx2RQWOv4L7IUl1RINu8A9sjvhzlxh2zkn4YDXWnhIRWZOq2lS	2024-09-17 01:10:14.888375	2024-09-17 01:10:14.888375
10	Julia3	email44@email.com	$2b$12$o5gnRFC73HK7x4KV1UFkpOwA5fkTkdUNK4wVq7V5SC3b/x3G8wYdq	2024-10-22 00:00:58.125922	2024-10-22 00:00:58.125922
12	fajnylogin6	email@email6.com	$2b$12$dFcE598aysC.oST7qPpyHOIDR.JwTWkJo1VSeJi0NXlW.6hpntpTa	2024-11-11 18:18:43.497994	2024-11-11 18:18:43.497994
13	nowy1	email1@email.com	$2b$12$HSLWabPFevNb/UPfymyzbuIPKHwyHbOcjtImBuVAyrC0w1D7B6hty	2024-11-14 00:07:49.95256	2024-11-14 00:07:49.95256
16	julka	email4@email.com	$2b$12$TL6yflaTNlAu0oWhcu1eUucXPrBHohjPpo0lbUBG51T/eVz.3iC5a	2024-12-02 21:10:10.257826	2024-12-02 21:10:10.257826
17	afterRefactor	email0@email.com	$2b$12$BVkfQ1ZFYxDV5SvxgLWLAeyzXgR/txLPlp0FaZ04WWkGOA.7Ob05.	2024-12-09 14:18:00.183076	2024-12-09 14:18:00.183076
18	ADMIN	admin@admin.com	$2b$12$kmkBaUGEMB.4L4FiV8kcF.yes0VvVKJFSTjnt.guJfJNVMLufjo9O	2024-12-09 19:52:58.129178	2024-12-09 19:52:58.129178
19	test0	email00@email.com	$2b$12$M/S6edc5giJ.cz8DJl1TOuHS9hBkgYBoBJYi5OB./S/E8Tl7in5Le	2024-12-13 01:37:53.748459	2024-12-13 01:37:53.748459
20	test2	email22@email.com	$2b$12$vrl/LbsNkjgG9YtmS6nA.OJ.TwxFaFKcPxaY45dGWlwfb/9nSGhLW	2024-12-15 16:49:55.137041	2024-12-15 16:49:55.137041
21	ADMINSZKOLNY	admin@szkolny.com	$2b$12$U/7GDTo9FLhclplr60FvGu7Q/f0IneyM.yu4dCPfQOryFI6EsR/xS	2024-12-17 20:05:12.892054	2024-12-17 20:05:12.892054
22	ADMINSZKOLNY2	admin.szkolny@email.com	$2b$12$3NKIKDY0/AXoxNjZz6.AiOWj1Ab3XV6FyzyLxIU/6.dgDxopSeoEC	2025-01-06 23:03:33.249066	2025-01-06 23:03:33.249066
23	e2etest	e2e@test.com	$2b$12$heQLieAaQaeX7vBgBFd6vefAJlxwZ0L3qAjiG87F0nUzPCPKBfKia	2025-01-10 17:01:01.990898	2025-01-10 17:01:01.990898
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 51, true);


--
-- Name: candidates_candidate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_candidate_id_seq', 26, true);


--
-- Name: class_criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_criteria_id_seq', 75, true);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_id_seq', 7, true);


--
-- Name: enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollment_id_seq', 5, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 120, true);


--
-- Name: school_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.school_admins_id_seq', 8, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schools_id_seq', 7, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 11, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 23, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- Name: profile_criteria class_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_criteria
    ADD CONSTRAINT class_criteria_pkey PRIMARY KEY (id);


--
-- Name: profiles classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollment_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: candidates pesel_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT pesel_key UNIQUE (pesel);


--
-- Name: school_admins school_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_admins
    ADD CONSTRAINT school_admins_pkey PRIMARY KEY (id);


--
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_login_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_login_key UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applications applications_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: applications applications_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_class_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_criteria class_criteria_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_criteria
    ADD CONSTRAINT class_criteria_class_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profile_criteria class_criteria_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_criteria
    ADD CONSTRAINT class_criteria_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: profiles classes_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT classes_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: applications fk_applications_enrollment_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_enrollment_id FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- Name: candidates fk_candidates_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT fk_candidates_users FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grades grades_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE;


--
-- Name: grades grades_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: school_admins school_admins_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_admins
    ADD CONSTRAINT school_admins_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- Name: school_admins school_admins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_admins
    ADD CONSTRAINT school_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

