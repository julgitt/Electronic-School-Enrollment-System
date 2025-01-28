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
    CONSTRAINT grades_type_check CHECK (((type)::text = ANY (ARRAY[('certificate'::character varying)::text, ('exam'::character varying)::text])))
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
\.


--
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, pesel, first_name, last_name, created_at, updated_at, user_id) FROM stdin;
169917	89050675527	Adam	Wiśniewski	2025-01-23 22:36:55.775884	2025-01-23 22:36:55.775884	235
169918	61080138676	Katarzyna	Wiśniewska	2025-01-23 22:38:26.461422	2025-01-23 22:38:26.461422	235
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollments (id, round, start_date, end_date) FROM stdin;
6	1	2025-01-21	2025-01-23
7	2	2025-01-24	2025-02-20
\.


--
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grades (id, candidate_id, subject_id, grade, type, created_at, updated_at) FROM stdin;
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
6	lingwistyczny	5	24	2024-12-18 20:14:40.698265	2024-12-18 20:14:40.698265
7	architektoniczny	5	20	2024-12-18 20:16:01.117352	2024-12-18 20:16:01.117352
3	elektryk	2	28	2024-11-17 23:07:44.17441	2024-11-17 23:07:44.17441
\.


--
-- Data for Name: school_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.school_admins (id, school_id, user_id, created_at, updated_at) FROM stdin;
11	233	236	2025-01-24 00:25:24.389705	2025-01-24 00:25:24.389705
12	3	236	2025-01-24 00:25:24.389705	2025-01-24 00:25:24.389705
\.


--
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, name, created_at, updated_at) FROM stdin;
1	Technikum nr 24	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
2	Szkoła zawodowa nr 3	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
3	Liceum Ogólnokształcące nr 1	2024-11-17 14:40:44.745302	2024-11-17 14:40:44.745302
5	Technikum nr 4	2024-12-16 21:53:55.842103	2024-12-16 21:53:55.842103
233	Liceum Ogólnokształcące nr 20	2025-01-23 22:00:45.267038	2025-01-23 22:00:45.267038
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
234	admin	2025-01-23 21:57:42.883088	2025-01-23 21:57:42.883088
235	user	2025-01-23 22:34:58.707602	2025-01-23 22:34:58.707602
236	schoolAdmin	2025-01-23 22:39:48.268128	2025-01-23 22:39:48.268128
238	user	2025-01-27 23:57:15.089376	2025-01-27 23:57:15.089376
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, created_at, updated_at) FROM stdin;
234	administrator	admin@admin.com	$2b$12$EYqRv9qxxAP/zuS6sEKDMu0o4a7cIVZ6Xsy5eObwtmS7rplqdETGK	2025-01-23 21:57:42.883088	2025-01-23 21:57:42.883088
235	JanWiśniewski	email@email.com	$2b$12$gPqwsW7dFZ6P3Wn4y4AS3.BVzGvxZAlbe4Yl7Fk9ni7nkNGSMhGem	2025-01-23 22:34:58.707602	2025-01-23 22:34:58.707602
236	AdministratorLiceum	admin@liceum.com	$2b$12$CAGeACTSGA/hMB03PYaJOu84tA/QL6ikasrnuOof/8I4dErGiiTIy	2025-01-23 22:39:48.268128	2025-01-23 22:39:48.268128
238	e2etest	e2e@test.com	$2b$12$vSIvp5z0//pO1T3MNMmWV.Dj5w.WhJ4aWbP7xFErD4iVm6/z20hJm	2025-01-27 23:57:15.089376	2025-01-27 23:57:15.089376
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 1, false);


--
-- Name: candidates_candidate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidates_candidate_id_seq', 169919, true);


--
-- Name: class_criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.class_criteria_id_seq', 108475, true);


--
-- Name: classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.classes_id_seq', 21687, true);


--
-- Name: enrollment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollment_id_seq', 7, true);


--
-- Name: grades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grades_id_seq', 2038734, true);


--
-- Name: school_admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.school_admins_id_seq', 12, true);


--
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schools_id_seq', 233, true);


--
-- Name: subjects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subjects_id_seq', 11, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 238, true);


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

