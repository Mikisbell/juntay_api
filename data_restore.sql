SET session_replication_role = 'replica';
SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict jrm1o3vfDihXsLm5VOLvKAgxajUbrgpfeHN9BIt8RtUNHiLVTZ6HeOGCOYouFYI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '9b543e59-23cd-43e6-848e-c4973baa3d92', '{"action":"login","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-12-16 13:12:49.241822+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b24d96c6-1e05-47bc-be58-2f28ca8c8b7b', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 16:24:57.466171+00', ''),
	('00000000-0000-0000-0000-000000000000', '0028e63e-864c-4286-b9e3-719e8d4f6541', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 16:24:57.471477+00', ''),
	('00000000-0000-0000-0000-000000000000', '528fec8f-67b1-4707-bb31-abcebf7cabb1', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 16:24:57.690803+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c29efbf-0b23-4f3a-89b8-ade57a804142', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 18:18:04.08765+00', ''),
	('00000000-0000-0000-0000-000000000000', '6b776cf4-5533-466b-a257-ead7e2c9b48c', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 18:18:04.092012+00', ''),
	('00000000-0000-0000-0000-000000000000', '9729874d-57f7-41db-9f61-7eaa16f5d5b1', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 18:18:04.190129+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f750eaf8-e421-4c16-9f96-0645d403008a', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 19:18:25.838008+00', ''),
	('00000000-0000-0000-0000-000000000000', '6e5885d0-0a8b-44f8-89dc-64b16005e6fc', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 19:18:25.843399+00', ''),
	('00000000-0000-0000-0000-000000000000', '76b69e7d-266b-4934-b91d-c5e1ac241bd8', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 19:18:25.94432+00', ''),
	('00000000-0000-0000-0000-000000000000', '2601c7d0-e204-4959-903c-8b3bb5710df1', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 20:21:15.665417+00', ''),
	('00000000-0000-0000-0000-000000000000', 'efd68cbb-58b3-4209-bca0-37e4fab7362b', '{"action":"token_revoked","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 20:21:15.672954+00', ''),
	('00000000-0000-0000-0000-000000000000', '1cbd0990-dee9-4cf7-b0c6-f00203025f5e', '{"action":"token_refreshed","actor_id":"00000000-0000-0000-0000-000000000010","actor_username":"admin@juntay.com","actor_via_sso":false,"log_type":"token"}', '2025-12-16 20:21:15.811617+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'cajero1@juntay.com', '$2a$06$dtgUrEhfFY9lMuhY/nzake/dqkfKDbcPvPMATa8V9z4lQ.BbooYYK', '2025-12-16 06:00:44.981351+00', NULL, '', NULL, '', '2025-12-16 06:00:44.981351+00', '', '', NULL, '2025-12-16 06:00:44.981351+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'admin@juntay.com', '$2a$06$hmwQPfQXJUCiS8.jwZPuDOYr6/JRL5LdDzVc614Xvbd9H2wVE6UI6', '2025-12-16 06:00:44.981351+00', NULL, '', NULL, '', '2025-12-16 06:00:44.981351+00', '', '', NULL, '2025-12-16 13:12:49.248699+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 20:21:15.684668+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000010', '{"sub": "00000000-0000-0000-0000-000000000010", "email": "admin@juntay.com"}', 'email', '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00', '8ad2e6b0-c7b9-4eef-b90f-eff35f3bd013'),
	('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000011', '{"sub": "00000000-0000-0000-0000-000000000011", "email": "cajero1@juntay.com"}', 'email', '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00', 'bfd4c227-4449-4cd4-a6a9-4908f3a96854');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter") VALUES
	('72e2daf2-96c1-4756-bf8c-d5fcbb41c39e', '00000000-0000-0000-0000-000000000010', '2025-12-16 13:12:49.249189+00', '2025-12-16 20:21:15.814059+00', NULL, 'aal1', NULL, '2025-12-16 20:21:15.813987', 'Next.js Middleware', '172.19.0.1', NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('72e2daf2-96c1-4756-bf8c-d5fcbb41c39e', '2025-12-16 13:12:49.277588+00', '2025-12-16 13:12:49.277588+00', 'password', 'd8e565ee-0a30-4750-88ef-6391f31acc68');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'e3agxkdvuliu', '00000000-0000-0000-0000-000000000010', true, '2025-12-16 13:12:49.258579+00', '2025-12-16 16:24:57.472411+00', NULL, '72e2daf2-96c1-4756-bf8c-d5fcbb41c39e'),
	('00000000-0000-0000-0000-000000000000', 2, 'g6mfkagodbt3', '00000000-0000-0000-0000-000000000010', true, '2025-12-16 16:24:57.47546+00', '2025-12-16 18:18:04.093025+00', 'e3agxkdvuliu', '72e2daf2-96c1-4756-bf8c-d5fcbb41c39e'),
	('00000000-0000-0000-0000-000000000000', 3, 'kcomvgxq375e', '00000000-0000-0000-0000-000000000010', true, '2025-12-16 18:18:04.096528+00', '2025-12-16 19:18:25.844134+00', 'g6mfkagodbt3', '72e2daf2-96c1-4756-bf8c-d5fcbb41c39e'),
	('00000000-0000-0000-0000-000000000000', 4, 'vgc4abnn6b34', '00000000-0000-0000-0000-000000000010', true, '2025-12-16 19:18:25.84772+00', '2025-12-16 20:21:15.674018+00', 'kcomvgxq375e', '72e2daf2-96c1-4756-bf8c-d5fcbb41c39e'),
	('00000000-0000-0000-0000-000000000000', 5, 'vh7sptof4kqq', '00000000-0000-0000-0000-000000000010', false, '2025-12-16 20:21:15.67992+00', '2025-12-16 20:21:15.67992+00', 'vgc4abnn6b34', '72e2daf2-96c1-4756-bf8c-d5fcbb41c39e');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: personas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."personas" ("id", "tipo_documento", "numero_documento", "nombres", "apellido_paterno", "apellido_materno", "email", "telefono_principal", "telefono_secundario", "direccion", "created_at", "updated_at") VALUES
	('f92956e6-6f8b-4f31-acef-276fa520f04b', 'DNI', '12345678', 'Carlos', 'Rodriguez', 'Lopez', 'admin@juntay.com', NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00'),
	('55b57db4-246c-471e-a3b4-87adc8af4296', 'DNI', '87654321', 'Maria', 'Gonzalez', 'Perez', 'cajero1@juntay.com', NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00'),
	('c20ffe12-d3b2-4bf5-88d1-ec89939216f0', 'DNI', '20003695', 'AGUSTINA ESTELA', 'ALVA', 'CASTAÑEDA', 'socio@gmail.com', '943818788', NULL, 'yui - hjklkh', '2025-12-16 19:14:40.694842+00', '2025-12-16 19:14:40.694842+00'),
	('00049279-1190-4120-aae7-bd87689475c6', 'DNI', '20009565', 'TEODOSIA LUZ', 'PACAHUALA', 'MALDONADO', 'inv@inv.com', '943818788', NULL, 'ssss - sss', '2025-12-16 19:27:51.850653+00', '2025-12-16 19:27:51.850653+00'),
	('bd6117d6-01d5-4b98-aeb5-9e6d34976ff1', 'DNI', '43558788', 'VALERIA', 'CHARCA', 'MEJIA', 'ewww', '943818788', NULL, 'ewqeqwe - ewqewqeqw', '2025-12-16 19:49:01.844621+00', '2025-12-16 19:49:01.844621+00');


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."empleados" ("id", "persona_id", "user_id", "cargo", "sucursal_id", "activo", "fecha_ingreso", "fecha_salida", "created_at", "updated_at") VALUES
	('47f18526-4edb-4a10-8be6-74d7d251b484', '55b57db4-246c-471e-a3b4-87adc8af4296', '00000000-0000-0000-0000-000000000011', 'cajero', NULL, true, '2025-12-16', NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00'),
	('9ff9d847-879c-4199-823e-45599fc77049', 'f92956e6-6f8b-4f31-acef-276fa520f04b', '00000000-0000-0000-0000-000000000010', 'admin', NULL, true, '2025-12-16', NULL, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00');


--
-- Data for Name: auditoria_transacciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."auditoria_transacciones" ("id", "tabla_afectada", "registro_id", "accion", "usuario_id", "empleado_id", "datos_antes", "datos_despues", "ip_address", "user_agent", "timestamp") VALUES
	('f016852f-8b12-4f20-b96c-63fa7e6849f5', 'garantias', '00000000-0000-0000-0000-000000000040', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000040", "anio": null, "area": null, "peso": null, "fotos": null, "marca": null, "placa": null, "serie": null, "estado": "custodia", "modelo": null, "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "capacidad": null, "quilataje": null, "ubicacion": null, "cliente_id": "00000000-0000-0000-0000-000000000020", "created_at": "2025-12-01T06:00:44.981351", "credito_id": null, "fotos_urls": null, "updated_at": "2025-12-16T06:00:44.981351+00:00", "descripcion": "Cadena de oro 18k, 25 gramos", "estado_bien": null, "fecha_venta": null, "kilometraje": null, "categoria_id": "00000000-0000-0000-0000-000000000030", "precio_venta": null, "subcategoria": null, "valor_tasacion": 1500.00, "partida_registral": null, "valor_prestamo_sugerido": 1050.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('5d7fdc8e-794c-4613-949d-a5c972cdbbe1', 'garantias', '00000000-0000-0000-0000-000000000041', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000041", "anio": null, "area": null, "peso": null, "fotos": null, "marca": null, "placa": null, "serie": null, "estado": "custodia", "modelo": null, "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "capacidad": null, "quilataje": null, "ubicacion": null, "cliente_id": "00000000-0000-0000-0000-000000000021", "created_at": "2025-12-06T06:00:44.981351", "credito_id": null, "fotos_urls": null, "updated_at": "2025-12-16T06:00:44.981351+00:00", "descripcion": "Laptop HP Pavilion 15 - Intel i5, 8GB RAM", "estado_bien": null, "fecha_venta": null, "kilometraje": null, "categoria_id": "00000000-0000-0000-0000-000000000031", "precio_venta": null, "subcategoria": null, "valor_tasacion": 2000.00, "partida_registral": null, "valor_prestamo_sugerido": 1200.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('cac9c967-f59d-4409-a8c7-386d31d8cba3', 'garantias', '00000000-0000-0000-0000-000000000042', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000042", "anio": null, "area": null, "peso": null, "fotos": null, "marca": null, "placa": null, "serie": null, "estado": "custodia", "modelo": null, "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "capacidad": null, "quilataje": null, "ubicacion": null, "cliente_id": "00000000-0000-0000-0000-000000000022", "created_at": "2025-12-11T06:00:44.981351", "credito_id": null, "fotos_urls": null, "updated_at": "2025-12-16T06:00:44.981351+00:00", "descripcion": "Anillo de oro 14k con diamante", "estado_bien": null, "fecha_venta": null, "kilometraje": null, "categoria_id": "00000000-0000-0000-0000-000000000030", "precio_venta": null, "subcategoria": null, "valor_tasacion": 800.00, "partida_registral": null, "valor_prestamo_sugerido": 560.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('77e0350b-edb4-41df-99ac-d958809f54bf', 'garantias', '00000000-0000-0000-0000-000000000043', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000043", "anio": null, "area": null, "peso": null, "fotos": null, "marca": null, "placa": null, "serie": null, "estado": "remate", "modelo": null, "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "capacidad": null, "quilataje": null, "ubicacion": null, "cliente_id": "00000000-0000-0000-0000-000000000020", "created_at": "2025-09-17T06:00:44.981351", "credito_id": null, "fotos_urls": null, "updated_at": "2025-12-16T06:00:44.981351+00:00", "descripcion": "iPhone 12 Pro 128GB", "estado_bien": null, "fecha_venta": null, "kilometraje": null, "categoria_id": "00000000-0000-0000-0000-000000000031", "precio_venta": null, "subcategoria": null, "valor_tasacion": 1800.00, "partida_registral": null, "valor_prestamo_sugerido": 1080.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('f13e2d8f-b06b-4e22-b42f-be8ff786cd72', 'garantias', '00000000-0000-0000-0000-000000000044', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000044", "anio": null, "area": null, "peso": null, "fotos": null, "marca": null, "placa": null, "serie": null, "estado": "remate", "modelo": null, "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "capacidad": null, "quilataje": null, "ubicacion": null, "cliente_id": "00000000-0000-0000-0000-000000000021", "created_at": "2025-08-18T06:00:44.981351", "credito_id": null, "fotos_urls": null, "updated_at": "2025-12-16T06:00:44.981351+00:00", "descripcion": "Pulsera de oro 21k, 18 gramos", "estado_bien": null, "fecha_venta": null, "kilometraje": null, "categoria_id": "00000000-0000-0000-0000-000000000030", "precio_venta": null, "subcategoria": null, "valor_tasacion": 1200.00, "partida_registral": null, "valor_prestamo_sugerido": 840.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('dcaab6af-7f4a-4111-9a98-6e5f80c6dcc9', 'creditos', '00000000-0000-0000-0000-000000000050', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000050", "codigo": "CON-2024-001", "estado": "vigente", "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "cliente_id": "00000000-0000-0000-0000-000000000020", "created_at": "2025-12-16T06:00:44.981351", "created_by": null, "empresa_id": "00000000-0000-0000-0000-000000000001", "updated_at": "2025-12-16T06:00:44.981351", "garantia_id": "00000000-0000-0000-0000-000000000040", "fecha_inicio": null, "periodo_dias": 30, "tasa_interes": 10.00, "observaciones": null, "caja_origen_id": null, "codigo_credito": null, "monto_prestado": 1050.00, "saldo_pendiente": 1050.00, "estado_detallado": "vigente", "fecha_desembolso": "2025-12-01T06:00:44.981351", "fecha_cancelacion": null, "fecha_vencimiento": "2025-12-31", "interes_acumulado": 52.50, "dias_transcurridos": 15, "interes_devengado_actual": 52.50}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('7b98328d-5425-4900-aa68-e0e0b912d16f', 'creditos', '00000000-0000-0000-0000-000000000051', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000051", "codigo": "CON-2024-002", "estado": "vigente", "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "cliente_id": "00000000-0000-0000-0000-000000000021", "created_at": "2025-12-16T06:00:44.981351", "created_by": null, "empresa_id": "00000000-0000-0000-0000-000000000001", "updated_at": "2025-12-16T06:00:44.981351", "garantia_id": "00000000-0000-0000-0000-000000000041", "fecha_inicio": null, "periodo_dias": 30, "tasa_interes": 10.00, "observaciones": null, "caja_origen_id": null, "codigo_credito": null, "monto_prestado": 1200.00, "saldo_pendiente": 1200.00, "estado_detallado": "vigente", "fecha_desembolso": "2025-12-06T06:00:44.981351", "fecha_cancelacion": null, "fecha_vencimiento": "2026-01-05", "interes_acumulado": 60.00, "dias_transcurridos": 10, "interes_devengado_actual": 40.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('64312791-5279-4b0b-bb45-b3bbf4190d69', 'creditos', '00000000-0000-0000-0000-000000000052', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000052", "codigo": "CON-2024-003", "estado": "vigente", "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "cliente_id": "00000000-0000-0000-0000-000000000022", "created_at": "2025-12-16T06:00:44.981351", "created_by": null, "empresa_id": "00000000-0000-0000-0000-000000000001", "updated_at": "2025-12-16T06:00:44.981351", "garantia_id": "00000000-0000-0000-0000-000000000042", "fecha_inicio": null, "periodo_dias": 30, "tasa_interes": 10.00, "observaciones": null, "caja_origen_id": null, "codigo_credito": null, "monto_prestado": 560.00, "saldo_pendiente": 560.00, "estado_detallado": "vigente", "fecha_desembolso": "2025-12-11T06:00:44.981351", "fecha_cancelacion": null, "fecha_vencimiento": "2026-01-10", "interes_acumulado": 28.00, "dias_transcurridos": 5, "interes_devengado_actual": 9.33}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('1039debe-c1db-4917-98c2-768d16ea2a58', 'personas', 'c20ffe12-d3b2-4bf5-88d1-ec89939216f0', 'INSERT', '00000000-0000-0000-0000-000000000010', '9ff9d847-879c-4199-823e-45599fc77049', NULL, '{"id": "c20ffe12-d3b2-4bf5-88d1-ec89939216f0", "email": "socio@gmail.com", "nombres": "AGUSTINA ESTELA", "direccion": "yui - hjklkh", "created_at": "2025-12-16T19:14:40.694842+00:00", "updated_at": "2025-12-16T19:14:40.694842+00:00", "tipo_documento": "DNI", "apellido_materno": "CASTAÑEDA", "apellido_paterno": "ALVA", "numero_documento": "20003695", "telefono_principal": "943818788", "telefono_secundario": null}', '172.19.0.8', NULL, '2025-12-16 19:14:40.694842+00'),
	('448bc931-4738-4c16-a815-fe0a59c10e70', 'creditos', '00000000-0000-0000-0000-000000000053', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000053", "codigo": "CON-2024-004", "estado": "vencido", "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "cliente_id": "00000000-0000-0000-0000-000000000020", "created_at": "2025-12-16T06:00:44.981351", "created_by": null, "empresa_id": "00000000-0000-0000-0000-000000000001", "updated_at": "2025-12-16T06:00:44.981351", "garantia_id": "00000000-0000-0000-0000-000000000043", "fecha_inicio": null, "periodo_dias": 30, "tasa_interes": 10.00, "observaciones": null, "caja_origen_id": null, "codigo_credito": null, "monto_prestado": 1080.00, "saldo_pendiente": 1080.00, "estado_detallado": "en_gracia", "fecha_desembolso": "2025-09-17T06:00:44.981351", "fecha_cancelacion": null, "fecha_vencimiento": "2025-10-17", "interes_acumulado": 108.00, "dias_transcurridos": 90, "interes_devengado_actual": 324.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('0d920f82-8afb-4be4-b610-32ced2583532', 'creditos', '00000000-0000-0000-0000-000000000054', 'INSERT', NULL, NULL, NULL, '{"id": "00000000-0000-0000-0000-000000000054", "codigo": "CON-2024-005", "estado": "vencido", "_deleted": false, "_modified": "2025-12-16T06:00:44.981351+00:00", "cliente_id": "00000000-0000-0000-0000-000000000021", "created_at": "2025-12-16T06:00:44.981351", "created_by": null, "empresa_id": "00000000-0000-0000-0000-000000000001", "updated_at": "2025-12-16T06:00:44.981351", "garantia_id": "00000000-0000-0000-0000-000000000044", "fecha_inicio": null, "periodo_dias": 30, "tasa_interes": 10.00, "observaciones": null, "caja_origen_id": null, "codigo_credito": null, "monto_prestado": 840.00, "saldo_pendiente": 840.00, "estado_detallado": "pre_remate", "fecha_desembolso": "2025-08-18T06:00:44.981351", "fecha_cancelacion": null, "fecha_vencimiento": "2025-09-17", "interes_acumulado": 84.00, "dias_transcurridos": 120, "interes_devengado_actual": 336.00}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('47d9b781-48a2-4d10-ade0-2cf928bb2c70', 'personas', 'f92956e6-6f8b-4f31-acef-276fa520f04b', 'INSERT', NULL, NULL, NULL, '{"id": "f92956e6-6f8b-4f31-acef-276fa520f04b", "email": "admin@juntay.com", "nombres": "Carlos", "direccion": null, "created_at": "2025-12-16T06:00:44.981351+00:00", "updated_at": "2025-12-16T06:00:44.981351+00:00", "tipo_documento": "DNI", "apellido_materno": "Lopez", "apellido_paterno": "Rodriguez", "numero_documento": "12345678", "telefono_principal": null, "telefono_secundario": null}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('91b6934a-9754-426c-a555-235c4648d874', 'personas', '55b57db4-246c-471e-a3b4-87adc8af4296', 'INSERT', NULL, NULL, NULL, '{"id": "55b57db4-246c-471e-a3b4-87adc8af4296", "email": "cajero1@juntay.com", "nombres": "Maria", "direccion": null, "created_at": "2025-12-16T06:00:44.981351+00:00", "updated_at": "2025-12-16T06:00:44.981351+00:00", "tipo_documento": "DNI", "apellido_materno": "Perez", "apellido_paterno": "Gonzalez", "numero_documento": "87654321", "telefono_principal": null, "telefono_secundario": null}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('63e333ad-4513-449b-91d3-e90a748bee64', 'empleados', '47f18526-4edb-4a10-8be6-74d7d251b484', 'INSERT', NULL, NULL, NULL, '{"id": "47f18526-4edb-4a10-8be6-74d7d251b484", "cargo": "cajero", "activo": true, "user_id": "00000000-0000-0000-0000-000000000011", "created_at": "2025-12-16T06:00:44.981351+00:00", "persona_id": "55b57db4-246c-471e-a3b4-87adc8af4296", "updated_at": "2025-12-16T06:00:44.981351+00:00", "sucursal_id": null, "fecha_salida": null, "fecha_ingreso": "2025-12-16"}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('8b89ad10-b9fe-4d0b-bb51-be27a74644f7', 'empleados', '9ff9d847-879c-4199-823e-45599fc77049', 'INSERT', NULL, NULL, NULL, '{"id": "9ff9d847-879c-4199-823e-45599fc77049", "cargo": "admin", "activo": true, "user_id": "00000000-0000-0000-0000-000000000010", "created_at": "2025-12-16T06:00:44.981351+00:00", "persona_id": "f92956e6-6f8b-4f31-acef-276fa520f04b", "updated_at": "2025-12-16T06:00:44.981351+00:00", "sucursal_id": null, "fecha_salida": null, "fecha_ingreso": "2025-12-16"}', '172.19.0.1', NULL, '2025-12-16 06:00:44.981351+00'),
	('6c367749-c7e1-40ad-aa9b-de293aea8f33', 'personas', '00049279-1190-4120-aae7-bd87689475c6', 'INSERT', '00000000-0000-0000-0000-000000000010', '9ff9d847-879c-4199-823e-45599fc77049', NULL, '{"id": "00049279-1190-4120-aae7-bd87689475c6", "email": "inv@inv.com", "nombres": "TEODOSIA LUZ", "direccion": "ssss - sss", "created_at": "2025-12-16T19:27:51.850653+00:00", "updated_at": "2025-12-16T19:27:51.850653+00:00", "tipo_documento": "DNI", "apellido_materno": "MALDONADO", "apellido_paterno": "PACAHUALA", "numero_documento": "20009565", "telefono_principal": "943818788", "telefono_secundario": null}', '172.19.0.8', NULL, '2025-12-16 19:27:51.850653+00'),
	('4869298c-1116-493b-a7f9-8389ecc55175', 'personas', 'bd6117d6-01d5-4b98-aeb5-9e6d34976ff1', 'INSERT', '00000000-0000-0000-0000-000000000010', '9ff9d847-879c-4199-823e-45599fc77049', NULL, '{"id": "bd6117d6-01d5-4b98-aeb5-9e6d34976ff1", "email": "ewww", "nombres": "VALERIA", "direccion": "ewqeqwe - ewqewqeqw", "created_at": "2025-12-16T19:49:01.844621+00:00", "updated_at": "2025-12-16T19:49:01.844621+00:00", "tipo_documento": "DNI", "apellido_materno": "MEJIA", "apellido_paterno": "CHARCA", "numero_documento": "43558788", "telefono_principal": "943818788", "telefono_secundario": null}', '172.19.0.8', NULL, '2025-12-16 19:49:01.844621+00');


--
-- Data for Name: empresas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."empresas" ("id", "ruc", "razon_social", "nombre_comercial", "direccion", "telefono", "email", "logo_url", "activo", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000001', '20123456789', 'EMPEÑOS JUNTAY S.A.C.', 'JUNTAY', 'Av. Los Comerciantes 456, Lima', '01-2345678', 'contacto@juntay.pe', NULL, true, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00');


--
-- Data for Name: boveda_central; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."boveda_central" ("id", "empresa_id", "saldo_total", "saldo_disponible", "saldo_asignado", "fecha_actualizacion", "estado") VALUES
	('3b29c991-b8cb-42c5-a8c1-d1a06ff34dd6', NULL, 0.00, 0.00, 0.00, '2025-12-16 06:00:44.981351+00', 'activa');


--
-- Data for Name: cuentas_financieras; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."cuentas_financieras" ("id", "nombre", "tipo", "saldo", "moneda", "activo", "created_at", "updated_at", "banco_asociado", "numero_cuenta", "titular_cuenta", "es_principal") VALUES
	('1eab8215-ed10-4d78-b8d5-158fd4743307', 'Bóveda Principal (Legacy)', 'EFECTIVO', 10000.00, 'PEN', true, '2025-12-16 13:58:25.609482+00', '2025-12-16 20:26:45.397506+00', NULL, NULL, NULL, true);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."usuarios" ("id", "empresa_id", "email", "nombres", "apellido_paterno", "apellido_materno", "dni", "rol_id", "rol", "activo", "created_at", "updated_at") VALUES
	('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'admin@juntay.com', 'Carlos', 'Rodriguez', 'Lopez', '12345678', NULL, 'admin', true, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'cajero1@juntay.com', 'Maria', 'Gonzalez', 'Perez', '87654321', NULL, 'admin', true, '2025-12-16 06:00:44.981351+00', '2025-12-16 06:00:44.981351+00');


--
-- Data for Name: cajas_operativas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: categorias_garantia; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categorias_garantia" ("id", "nombre", "porcentaje_prestamo_maximo") VALUES
	('00000000-0000-0000-0000-000000000030', 'Oro y Joyas', 70.00),
	('00000000-0000-0000-0000-000000000031', 'Electrónica', 60.00),
	('00000000-0000-0000-0000-000000000032', 'Vehículos', 50.00);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."clientes" ("id", "empresa_id", "tipo_documento", "numero_documento", "nombres", "apellido_paterno", "apellido_materno", "email", "telefono_principal", "direccion", "score_crediticio", "activo", "created_at", "persona_id", "ubigeo_cod", "departamento", "provincia", "distrito", "_deleted", "_modified") VALUES
	('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'DNI', '45678912', 'Juan', 'Perez', 'Garcia', NULL, '987654321', 'Jr. Los Pinos 123, San Juan de Lurigancho', 500, true, '2025-12-16 06:00:44.981351+00', NULL, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'DNI', '78912345', 'Ana', 'Martinez', 'Lopez', NULL, '987123456', 'Av. Colonial 789, Callao', 500, true, '2025-12-16 06:00:44.981351+00', NULL, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'DNI', '32165498', 'Luis', 'Ramirez', 'Torres', NULL, '912345678', 'Calle Las Flores 456, Ate', 500, true, '2025-12-16 06:00:44.981351+00', NULL, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00'),
	('2d9e0d7a-8b5f-41ab-be32-04fb9c26d05b', NULL, 'DNI', '20003695', 'AGUSTINA ESTELA', 'ALVA', 'CASTAÑEDA', 'socio@gmail.com', '943818788', 'yui - hjklkh', 500, true, '2025-12-16 19:14:40.758026+00', 'c20ffe12-d3b2-4bf5-88d1-ec89939216f0', '120114', '', '', '', false, '2025-12-16 19:14:40.758026+00'),
	('e2eb3be0-95cd-4129-a1f9-0c71ac177689', NULL, 'DNI', '20009565', 'TEODOSIA LUZ', 'PACAHUALA', 'MALDONADO', 'inv@inv.com', '943818788', 'ssss - sss', 500, true, '2025-12-16 19:27:51.921369+00', '00049279-1190-4120-aae7-bd87689475c6', '120114', '', '', '', false, '2025-12-16 19:27:51.921369+00'),
	('65febc1c-d5e5-48e0-bbfe-94a02ca7849e', NULL, 'DNI', '43558788', 'VALERIA', 'CHARCA', 'MEJIA', 'ewww', '943818788', 'ewqeqwe - ewqewqeqw', 500, true, '2025-12-16 19:49:01.910901+00', 'bd6117d6-01d5-4b98-aeb5-9e6d34976ff1', '120114', '', '', '', false, '2025-12-16 19:49:01.910901+00');


--
-- Data for Name: creditos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."creditos" ("id", "codigo", "cliente_id", "garantia_id", "caja_origen_id", "empresa_id", "monto_prestado", "tasa_interes", "periodo_dias", "fecha_desembolso", "fecha_vencimiento", "saldo_pendiente", "interes_acumulado", "estado", "created_at", "updated_at", "estado_detallado", "dias_transcurridos", "interes_devengado_actual", "codigo_credito", "fecha_inicio", "observaciones", "created_by", "_deleted", "_modified", "fecha_cancelacion") VALUES
	('00000000-0000-0000-0000-000000000050', 'CON-2024-001', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000040', NULL, '00000000-0000-0000-0000-000000000001', 1050.00, 10.00, 30, '2025-12-01 06:00:44.981351', '2025-12-31', 1050.00, 52.50, 'vigente', '2025-12-16 06:00:44.981351', '2025-12-16 06:00:44.981351', 'vigente', 15, 52.50, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00', NULL),
	('00000000-0000-0000-0000-000000000051', 'CON-2024-002', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000041', NULL, '00000000-0000-0000-0000-000000000001', 1200.00, 10.00, 30, '2025-12-06 06:00:44.981351', '2026-01-05', 1200.00, 60.00, 'vigente', '2025-12-16 06:00:44.981351', '2025-12-16 06:00:44.981351', 'vigente', 10, 40.00, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00', NULL),
	('00000000-0000-0000-0000-000000000052', 'CON-2024-003', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000042', NULL, '00000000-0000-0000-0000-000000000001', 560.00, 10.00, 30, '2025-12-11 06:00:44.981351', '2026-01-10', 560.00, 28.00, 'vigente', '2025-12-16 06:00:44.981351', '2025-12-16 06:00:44.981351', 'vigente', 5, 9.33, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00', NULL),
	('00000000-0000-0000-0000-000000000053', 'CON-2024-004', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000043', NULL, '00000000-0000-0000-0000-000000000001', 1080.00, 10.00, 30, '2025-09-17 06:00:44.981351', '2025-10-17', 1080.00, 108.00, 'vencido', '2025-12-16 06:00:44.981351', '2025-12-16 06:00:44.981351', 'en_gracia', 90, 324.00, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00', NULL),
	('00000000-0000-0000-0000-000000000054', 'CON-2024-005', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000044', NULL, '00000000-0000-0000-0000-000000000001', 840.00, 10.00, 30, '2025-08-18 06:00:44.981351', '2025-09-17', 840.00, 84.00, 'vencido', '2025-12-16 06:00:44.981351', '2025-12-16 06:00:44.981351', 'pre_remate', 120, 336.00, NULL, NULL, NULL, NULL, false, '2025-12-16 06:00:44.981351+00', NULL);


--
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: provincias; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: distritos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: eventos_sistema; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: garantias; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."garantias" ("id", "cliente_id", "categoria_id", "descripcion", "valor_tasacion", "valor_prestamo_sugerido", "estado", "fotos_urls", "created_at", "marca", "modelo", "serie", "subcategoria", "estado_bien", "anio", "placa", "kilometraje", "area", "ubicacion", "partida_registral", "peso", "quilataje", "capacidad", "fecha_venta", "precio_venta", "credito_id", "fotos", "updated_at", "_deleted", "_modified") VALUES
	('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000030', 'Cadena de oro 18k, 25 gramos', 1500.00, 1050.00, 'custodia', NULL, '2025-12-01 06:00:44.981351', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000031', 'Laptop HP Pavilion 15 - Intel i5, 8GB RAM', 2000.00, 1200.00, 'custodia', NULL, '2025-12-06 06:00:44.981351', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000030', 'Anillo de oro 14k con diamante', 800.00, 560.00, 'custodia', NULL, '2025-12-11 06:00:44.981351', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000031', 'iPhone 12 Pro 128GB', 1800.00, 1080.00, 'remate', NULL, '2025-09-17 06:00:44.981351', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', false, '2025-12-16 06:00:44.981351+00'),
	('00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000030', 'Pulsera de oro 21k, 18 gramos', 1200.00, 840.00, 'remate', NULL, '2025-08-18 06:00:44.981351', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 06:00:44.981351+00', false, '2025-12-16 06:00:44.981351+00');


--
-- Data for Name: inversionistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."inversionistas" ("id", "persona_id", "tipo_relacion", "participacion_porcentaje", "fecha_ingreso", "activo", "created_at", "metadata") VALUES
	('1dc904de-b33f-421d-8cc1-e82264804269', '00049279-1190-4120-aae7-bd87689475c6', 'PRESTAMISTA', 10.00, '2025-12-16', true, '2025-12-16 19:28:19.982977+00', '{}');


--
-- Data for Name: movimientos_boveda_auditoria; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: movimientos_caja_operativa; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notificaciones_enviadas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: notificaciones_pendientes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sugerencias_catalogos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: transacciones_capital; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transacciones_capital" ("id", "inversionista_id", "origen_cuenta_id", "destino_cuenta_id", "tipo", "monto", "descripcion", "evidencia_ref", "fecha_operacion", "created_by", "metodo_pago", "numero_operacion", "banco_origen", "metadata") VALUES
	('b98c2edd-15b3-4c37-85c4-27025380a637', '1dc904de-b33f-421d-8cc1-e82264804269', NULL, '1eab8215-ed10-4d78-b8d5-158fd4743307', 'APORTE', 10000.00, 'durnate un mes', '5454fda', '2025-12-16 20:26:45.397506+00', NULL, 'EFECTIVO', NULL, NULL, '{}');


--
-- Data for Name: verificacion_whatsapp; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."verificacion_whatsapp" ("id", "telefono", "codigo", "creado_en", "expira_en", "verificado", "creado_por") VALUES
	('9a3521db-c69e-4a17-8b8d-e27044c19f56', '943818788', '815051', '2025-12-16 19:14:12.354577+00', '2025-12-16 19:19:12.338+00', true, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('garantias', 'garantias', NULL, '2025-12-16 06:01:28.243398+00', '2025-12-16 06:01:28.243398+00', true, false, 5242880, '{image/jpeg,image/png,image/webp,image/jpg}', NULL, 'STANDARD'),
	('evidencias', 'evidencias', NULL, '2025-12-16 06:01:28.267628+00', '2025-12-16 06:01:28.267628+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 5, true);


--
-- Name: eventos_sistema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."eventos_sistema_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict jrm1o3vfDihXsLm5VOLvKAgxajUbrgpfeHN9BIt8RtUNHiLVTZ6HeOGCOYouFYI

RESET ALL;
