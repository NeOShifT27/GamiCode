PGDMP         ,                z           GamiCode    13.0    13.0     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16582    GamiCode    DATABASE     f   CREATE DATABASE "GamiCode" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'French_France.1252';
    DROP DATABASE "GamiCode";
                postgres    false            �            1259    16625    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL
);
    DROP TABLE public.users;
       public         heap    postgres    false            �            1259    16623    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    201            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    200            #           2604    16628    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    201    200    201            �          0    16625    users 
   TABLE DATA           :   COPY public.users (id, name, email, password) FROM stdin;
    public          postgres    false    201   C       �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 7, true);
          public          postgres    false    200            %           2606    16635    users email 
   CONSTRAINT     G   ALTER TABLE ONLY public.users
    ADD CONSTRAINT email UNIQUE (email);
 5   ALTER TABLE ONLY public.users DROP CONSTRAINT email;
       public            postgres    false    201            '           2606    16633    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    201            �   @  x�e��r�@ D��wx&�
����lER��	����I�#�w����3�������Ĵ!�C�'`Ð�sZ��V�z�W�f�_��R8^<�Ӂ"�Ұ��XF���X�JW�k
�L�D���R���n�̮��ܪ�m4���n���e��P�ܚ)?�&/:�2�Rf!�a��J��`?�1u(����W��l�Ol]����Ud�7�_J�L��˴�+.=�2G�tDg	�m�B��pK�K�o~����g��DL����v�O!D�T)��w�#�T�	ὥ�㖛D�֬4���)�n�� ��G��     