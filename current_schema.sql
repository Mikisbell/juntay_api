--
-- PostgreSQL database dump
--

\restrict vWPtQN2elITYAAvsKwHMNdDCjwNniezEcsSX17rpHUqNUwUEb5wAVkSs9wKgR1Y

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
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: moddatetime; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;


--
-- Name: EXTENSION moddatetime; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION moddatetime IS 'functions for tracking last modification time';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: banco_peru; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.banco_peru AS ENUM (
    'BCP',
    'BBVA',
    'INTERBANK',
    'SCOTIABANK',
    'BANCO_NACION',
    'CAJA_AREQUIPA',
    'CAJA_PIURA',
    'CAJA_CUSCO',
    'CAJA_HUANCAYO',
    'MIBANCO',
    'PICHINCHA',
    'BANBIF',
    'OTRO'
);


ALTER TYPE public.banco_peru OWNER TO postgres;

--
-- Name: estado_contrato_fondeo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_contrato_fondeo AS ENUM (
    'ACTIVO',
    'PAUSADO',
    'LIQUIDADO',
    'CANCELADO'
);


ALTER TYPE public.estado_contrato_fondeo OWNER TO postgres;

--
-- Name: frecuencia_pago_fondeo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.frecuencia_pago_fondeo AS ENUM (
    'SEMANAL',
    'QUINCENAL',
    'MENSUAL',
    'TRIMESTRAL',
    'AL_VENCIMIENTO'
);


ALTER TYPE public.frecuencia_pago_fondeo OWNER TO postgres;

--
-- Name: metodo_pago_peru; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.metodo_pago_peru AS ENUM (
    'EFECTIVO',
    'YAPE',
    'PLIN',
    'TRANSFERENCIA',
    'CCI',
    'CHEQUE',
    'DEPOSITO_VENTANILLA',
    'AGENTE'
);


ALTER TYPE public.metodo_pago_peru OWNER TO postgres;

--
-- Name: tipo_contrato_fondeo; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_contrato_fondeo AS ENUM (
    'DEUDA_FIJA',
    'PARTICIPACION_EQUITY'
);


ALTER TYPE public.tipo_contrato_fondeo OWNER TO postgres;

--
-- Name: tipo_cuenta_financiera; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_cuenta_financiera AS ENUM (
    'EFECTIVO',
    'BANCO',
    'DIGITAL',
    'PASARELA'
);


ALTER TYPE public.tipo_cuenta_financiera OWNER TO postgres;

--
-- Name: tipo_inversionista; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_inversionista AS ENUM (
    'SOCIO',
    'PRESTAMISTA'
);


ALTER TYPE public.tipo_inversionista OWNER TO postgres;

--
-- Name: tipo_transaccion_capital; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_transaccion_capital AS ENUM (
    'APORTE',
    'RETIRO',
    'PAGO_INTERES',
    'TRANSFERENCIA_FONDEO',
    'APERTURA_CAJA',
    'CIERRE_CAJA'
);


ALTER TYPE public.tipo_transaccion_capital OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: actualizar_estado_credito(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_estado_credito() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_dias_hasta_vencimiento INT;
    v_dias_vencido INT;
    v_nuevo_estado VARCHAR(30);
BEGIN
    -- Solo actualizar si el estado no es terminal
    IF NEW.estado_detallado IN ('cancelado', 'renovado', 'ejecutado', 'anulado') THEN
        RETURN NEW;
    END IF;

    -- Calcular días hasta vencimiento
    v_dias_hasta_vencimiento := NEW.fecha_vencimiento - CURRENT_DATE;
    
    -- Calcular días vencido (solo si ya venció)
    IF CURRENT_DATE > NEW.fecha_vencimiento THEN
        v_dias_vencido := CURRENT_DATE - NEW.fecha_vencimiento;
    ELSE
        v_dias_vencido := 0;
    END IF;

    -- Determinar estado según días
    IF v_dias_vencido > 60 THEN
        v_nuevo_estado := 'pre_remate';
    ELSIF v_dias_vencido > 30 THEN
        v_nuevo_estado := 'en_gracia';
    ELSIF v_dias_vencido > 15 THEN
        v_nuevo_estado := 'en_mora';
    ELSIF v_dias_vencido > 0 THEN
        v_nuevo_estado := 'vencido';
    ELSIF v_dias_hasta_vencimiento <= 7 AND v_dias_hasta_vencimiento > 0 THEN
        v_nuevo_estado := 'por_vencer';
    ELSE
        -- Si saldo_pendiente = 0, está cancelado
        IF NEW.saldo_pendiente = 0 THEN
            v_nuevo_estado := 'cancelado';
        ELSE
            v_nuevo_estado := 'vigente';
        END IF;
    END IF;

    NEW.estado_detallado := v_nuevo_estado;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_estado_credito() OWNER TO postgres;

--
-- Name: FUNCTION actualizar_estado_credito(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.actualizar_estado_credito() IS 'Calcula automáticamente el estado_detallado basándose en fecha_vencimiento y saldo_pendiente.';


--
-- Name: actualizar_interes_devengado(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_interes_devengado() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Calcular días transcurridos
    v_dias := CURRENT_DATE - NEW.fecha_desembolso::date;
    
    -- Asegurar que no sea negativo
    IF v_dias < 0 THEN
        v_dias := 0;
    END IF;
    
    -- Calcular interés devengado
    IF v_dias > 0 AND NEW.monto_prestado > 0 THEN
        v_interes := ROUND(
            NEW.monto_prestado * (NEW.tasa_interes / 100.0) * (v_dias / 30.0),
            2
        );
    ELSE
        v_interes := 0.00;
    END IF;
    
    -- Actualizar valores
    NEW.dias_transcurridos := v_dias;
    NEW.interes_devengado_actual := v_interes;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_interes_devengado() OWNER TO postgres;

--
-- Name: admin_asignar_caja(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_boveda_origen_id UUID;
    v_saldo_boveda NUMERIC;
    v_caja_id UUID;
BEGIN
    -- A. Determinismo: Buscar SIEMPRE en la Bóveda Principal
    SELECT id, saldo INTO v_boveda_origen_id, v_saldo_boveda
    FROM public.cuentas_financieras
    WHERE es_principal = TRUE
    LIMIT 1;

    -- Validaciones Críticas
    IF v_boveda_origen_id IS NULL THEN
        RAISE EXCEPTION 'ERROR DE CONFIGURACIÓN: No existe una Bóveda Principal (es_principal=true).';
    END IF;

    IF v_saldo_boveda < p_monto THEN
        RAISE EXCEPTION 'LIQUIDEZ INSUFICIENTE: La Bóveda Principal tiene S/ %, se requieren S/ %. Notifique a Gerencia para fondeo.', v_saldo_boveda, p_monto;
    END IF;

    -- B. Crear Caja (Flujo normal)
    INSERT INTO public.cajas_operativas (
        usuario_id, 
        cuenta_origen_id, 
        numero_caja, 
        estado, 
        saldo_inicial, 
        saldo_actual,
        fecha_apertura
    ) VALUES (
        p_usuario_cajero_id,
        v_boveda_origen_id,
        (SELECT COALESCE(MAX(numero_caja), 0) + 1 FROM public.cajas_operativas),
        'abierta',
        p_monto,
        p_monto,
        NOW()
    ) RETURNING id INTO v_caja_id;

    -- C. Registrar Movimiento Contable
    INSERT INTO public.transacciones_capital (
        origen_cuenta_id,
        tipo,
        monto,
        descripcion,
        metadata
    ) VALUES (
        v_boveda_origen_id,
        'APERTURA_CAJA',
        p_monto,
        COALESCE(p_observacion, 'Apertura Automática (Default Vault)'),
        jsonb_build_object('caja_operativa_id', v_caja_id, 'cajero_id', p_usuario_cajero_id)
    );

    RETURN v_caja_id;
END;
$$;


ALTER FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text) OWNER TO postgres;

--
-- Name: admin_inyectar_capital(numeric, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_boveda_id UUID;
    v_movimiento_id UUID;
    v_saldo_anterior DECIMAL;
BEGIN
    -- 1. Obtener la Bóveda (Singleton)
    SELECT id, saldo_total INTO v_boveda_id, v_saldo_anterior 
    FROM public.boveda_central LIMIT 1;
    
    IF v_boveda_id IS NULL THEN
        RAISE EXCEPTION 'No existe una bóveda central inicializada.';
    END IF;

    -- 2. Actualizar Saldos Bóveda
    UPDATE public.boveda_central
    SET 
        saldo_total = saldo_total + p_monto,
        saldo_disponible = saldo_disponible + p_monto,
        fecha_actualizacion = NOW()
    WHERE id = v_boveda_id;

    -- 3. Registrar Auditoría
    INSERT INTO public.movimientos_boveda_auditoria (
        boveda_id, tipo, monto, 
        saldo_anterior, saldo_nuevo,
        referencia, metadata, usuario_responsable_id
    ) VALUES (
        v_boveda_id, 'INYECCION_CAPITAL', p_monto,
        v_saldo_anterior, v_saldo_anterior + p_monto,
        p_referencia || ' (' || p_origen || ')', 
        p_metadata,
        auth.uid()
    ) RETURNING id INTO v_movimiento_id;

    RETURN v_movimiento_id;
END;
$$;


ALTER FUNCTION public.admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb) OWNER TO postgres;

--
-- Name: anular_pago(uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid DEFAULT NULL::uuid) RETURNS TABLE(success boolean, mensaje text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_pago RECORD;
    v_credito RECORD;
BEGIN
    -- 1. Obtener pago
    SELECT * INTO v_pago FROM public.pagos WHERE id = p_pago_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Pago no encontrado'::TEXT;
        RETURN;
    END IF;
    
    IF v_pago.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este pago ya fue anulado'::TEXT;
        RETURN;
    END IF;
    
    -- 2. Marcar pago como anulado
    UPDATE public.pagos
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW()
    WHERE id = p_pago_id;
    
    -- 3. Revertir efecto en crédito (si aplica)
    IF v_pago.credito_id IS NOT NULL THEN
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente + COALESCE(v_pago.desglose_capital, 0),
            interes_acumulado = interes_acumulado + COALESCE(v_pago.desglose_interes, 0)
        WHERE id = v_pago.credito_id;
    END IF;
    
    -- 4. Registrar en auditoría
    INSERT INTO public.audit_log (
        tabla, registro_id, accion, usuario_id,
        datos_anteriores, datos_nuevos, metadata
    ) VALUES (
        'pagos', p_pago_id, 'ANULACION', p_usuario_id,
        to_jsonb(v_pago),
        jsonb_build_object('anulado', TRUE, 'motivo', p_motivo),
        jsonb_build_object('saldo_revertido', COALESCE(v_pago.desglose_capital, 0))
    );
    
    RETURN QUERY SELECT TRUE, 'Pago anulado y saldo de crédito restaurado'::TEXT;
END;
$$;


ALTER FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid) IS 'Marca pago como anulado y revierte efecto en crédito. Historial preservado.';


--
-- Name: audit_trigger_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.audit_trigger_function() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_usuario_id UUID;
    v_empleado_id UUID;
BEGIN
    -- Intentar obtener el usuario actual de Supabase
    BEGIN
        v_usuario_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;
    
    -- Si hay usuario, intentar obtener su empleado vinculado
    IF v_usuario_id IS NOT NULL THEN
        SELECT id INTO v_empleado_id 
        FROM public.empleados 
        WHERE user_id = v_usuario_id;
    END IF;
    
    -- Insertar registro de auditoría
    INSERT INTO public.auditoria_transacciones (
        tabla_afectada,
        registro_id,
        accion,
        usuario_id,
        empleado_id,
        datos_antes,
        datos_despues,
        ip_address
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        v_usuario_id,
        v_empleado_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
        inet_client_addr() -- IP del cliente
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION public.audit_trigger_function() OWNER TO postgres;

--
-- Name: FUNCTION audit_trigger_function(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.audit_trigger_function() IS 'Trigger automático que captura cambios en tablas críticas';


--
-- Name: buscar_clientes_con_creditos(text, boolean, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean DEFAULT false, p_limit integer DEFAULT 15) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(t), '[]'::json)
        FROM (
            SELECT 
                c.id,
                c.nombres,
                c.apellido_paterno,
                c.apellido_materno,
                c.numero_documento,
                COUNT(cr.id) FILTER (WHERE cr.estado IN ('vigente', 'pendiente')) AS contratos_vigentes
            FROM public.clientes c
            LEFT JOIN public.creditos cr ON cr.cliente_id = c.id
            WHERE 
                CASE 
                    WHEN p_is_dni THEN 
                        c.numero_documento ILIKE '%' || p_search_term || '%'
                    ELSE 
                        c.nombres ILIKE '%' || p_search_term || '%'
                        OR c.apellido_paterno ILIKE '%' || p_search_term || '%'
                        OR c.apellido_materno ILIKE '%' || p_search_term || '%'
                END
            GROUP BY c.id, c.nombres, c.apellido_paterno, c.apellido_materno, c.numero_documento
            ORDER BY contratos_vigentes DESC, c.nombres ASC
            LIMIT p_limit
        ) t
    );
END;
$$;


ALTER FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer) OWNER TO postgres;

--
-- Name: FUNCTION buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer) IS 'Búsqueda optimizada de clientes con conteo de créditos vigentes. Reparación para garantizar su existencia.';


--
-- Name: calcular_interes_actual(uuid, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date DEFAULT CURRENT_DATE) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_fecha_inicio DATE;
    v_dias INT;
    v_interes NUMERIC;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        fecha_desembolso::

date
    INTO v_monto, v_tasa, v_fecha_inicio
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular días transcurridos
    v_dias := p_fecha_calculo - v_fecha_inicio;
    
    -- Si es negativo o cero, no hay interés
    IF v_dias <= 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Calcular interés simple
    -- Fórmula: Capital × (Tasa/100) × (Días/30)
    v_interes := ROUND(
        v_monto * (v_tasa / 100.0) * (v_dias / 30.0),
        2
    );
    
    RETURN v_interes;
END;
$$;


ALTER FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date) OWNER TO postgres;

--
-- Name: FUNCTION calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date) IS 'Calcula el interés devengado para un crédito en una fecha específica';


--
-- Name: calcular_saldo_caja(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_saldo_caja(p_caja_id uuid) RETURNS numeric
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_saldo DECIMAL;
BEGIN
    -- Obtener el saldo actual directamente de la caja
    SELECT saldo_actual INTO v_saldo
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    RETURN COALESCE(v_saldo, 0);
END;
$$;


ALTER FUNCTION public.calcular_saldo_caja(p_caja_id uuid) OWNER TO postgres;

--
-- Name: cerrar_caja_oficial(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_saldo_sistema DECIMAL;
    v_diferencia DECIMAL;
    v_estado_cierre TEXT;
    v_caja RECORD;
BEGIN
    -- 1. OBTENER DATOS DE LA CAJA
    SELECT * INTO v_caja
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caja no encontrada';
    END IF;
    
    IF v_caja.estado != 'abierta' THEN
        RAISE EXCEPTION 'La caja ya está cerrada';
    END IF;

    -- 2. CALCULAR SALDO TEÓRICO (La verdad del sistema)
    v_saldo_sistema := public.calcular_saldo_caja(p_caja_id);

    -- 3. CALCULAR DIFERENCIA (Sobrante o Faltante)
    v_diferencia := p_monto_fisico - v_saldo_sistema;

    -- 4. DETERMINAR ESTADO DEL CIERRE
    IF ABS(v_diferencia) < 0.01 THEN  -- Tolerancia de 1 centavo
        v_estado_cierre := 'PERFECTO';
    ELSIF v_diferencia > 0 THEN
        v_estado_cierre := 'SOBRANTE';
    ELSE
        v_estado_cierre := 'FALTANTE';
    END IF;

    -- 5. CERRAR LA CAJA
    UPDATE public.cajas_operativas
    SET 
        estado = 'cerrada',
        fecha_cierre = NOW(),
        saldo_final_cierre = p_monto_fisico,
        diferencia_cierre = v_diferencia,
        observaciones_cierre = p_observaciones
    WHERE id = p_caja_id;

    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    -- 6. REGISTRAR EL MOVIMIENTO DE CIERRE
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto, 
        saldo_anterior, saldo_nuevo,
        descripcion, metadata,
        usuario_id  -- <--- CORRECCIÓN: Campo obligatorio
    ) VALUES (
        p_caja_id, 'INFO', 'CIERRE_CAJA', 0.01, -- Fix monto > 0 constraint (simbólico) o ajustar constraint
        v_saldo_sistema, 0, -- Saldo nuevo es 0 tras cierre
        'Cierre de caja. Estado: ' || v_estado_cierre || '. Diferencia: ' || v_diferencia,
        jsonb_build_object(
            'estado', v_estado_cierre,
            'diferencia', v_diferencia,
            'monto_fisico', p_monto_fisico,
            'saldo_sistema', v_saldo_sistema,
            'observaciones', p_observaciones
        ),
        v_caja.usuario_id -- <--- CORRECCIÓN: Valor del usuario
    );

    -- 7. RETORNAR REPORTE
    RETURN jsonb_build_object(
        'saldo_sistema', v_saldo_sistema,
        'saldo_fisico', p_monto_fisico,
        'diferencia', v_diferencia,
        'estado', v_estado_cierre,
        'fecha_cierre', NOW()
    );
END;
$$;


ALTER FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text) OWNER TO postgres;

--
-- Name: check_client_status_before_credit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_client_status_before_credit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    client_is_active BOOLEAN;
BEGIN
    SELECT activo INTO client_is_active
    FROM public.clientes
    WHERE id = NEW.cliente_id;

    IF client_is_active IS FALSE THEN
        RAISE EXCEPTION 'SEGURIDAD: No se puede otorgar crédito a un cliente INACTIVO o BLOQUEADO (ID: %).', NEW.cliente_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_client_status_before_credit() OWNER TO postgres;

--
-- Name: FUNCTION check_client_status_before_credit(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.check_client_status_before_credit() IS 'Valida que el cliente esté activo antes de crear un crédito. Previene fraude.';


--
-- Name: check_saldos_boveda(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_saldos_boveda() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.saldo_total <> (NEW.saldo_disponible + NEW.saldo_asignado) THEN
        RAISE EXCEPTION 'Inconsistencia en Bóveda: Total no coincide con partes.';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_saldos_boveda() OWNER TO postgres;

--
-- Name: conciliar_caja_dia(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.conciliar_caja_dia(p_fecha date) RETURNS TABLE(cuadra boolean, diferencia numeric, saldo_esperado numeric, saldo_real numeric, detalle jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_prestamos_total NUMERIC DEFAULT 0;
    v_pagos_total NUMERIC DEFAULT 0;
    v_saldo_inicial NUMERIC DEFAULT 0;
    v_saldo_final_esperado NUMERIC;
    v_saldo_final_real NUMERIC DEFAULT 0;
    v_diferencia NUMERIC;
BEGIN
    -- 1. Obtener saldo inicial (cierre del día anterior)
    -- Ajustado a tablas nuevas: saldo_final_cierre de cajas_operativas
    SELECT COALESCE(saldo_final_cierre, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas
    WHERE DATE(fecha_cierre) = p_fecha - 1
      AND estado = 'cerrada'
    ORDER BY fecha_cierre DESC
    LIMIT 1;
    
    -- 2. Sumar préstamos del día (egresos)
    SELECT COALESCE(SUM(monto_prestado), 0) INTO v_prestamos_total
    FROM public.creditos
    WHERE DATE(fecha_desembolso) = p_fecha;
    
    -- 3. Sumar pagos del día (ingresos)
    SELECT COALESCE(SUM(monto), 0) INTO v_pagos_total
    FROM public.pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND (anulado IS FALSE OR anulado IS NULL);
    
    -- 4. Calcular saldo esperado al final del día
    -- Saldo Inicial + Ingresos (Pagos) - Egresos (Préstamos)
    v_saldo_final_esperado := v_saldo_inicial - v_prestamos_total + v_pagos_total;
    
    -- 5. Obtener saldo real reportado por cajeros (Suma de todas las cajas del día)
    SELECT COALESCE(SUM(saldo_final_cierre), 0) INTO v_saldo_final_real
    FROM public.cajas_operativas
    WHERE DATE(fecha_cierre) = p_fecha
      AND estado = 'cerrada';
    
    -- 6. Calcular diferencia
    v_diferencia := v_saldo_final_real - v_saldo_final_esperado;
    
    -- 7. Retornar resultado
    RETURN QUERY SELECT 
        ABS(v_diferencia) < 0.01 as cuadra,
        v_diferencia as diferencia,
        v_saldo_final_esperado as saldo_esperado,
        v_saldo_final_real as saldo_real,
        jsonb_build_object(
            'saldo_inicial', v_saldo_inicial,
            'prestamos', v_prestamos_total,
            'pagos', v_pagos_total,
            'fecha', p_fecha
        ) as detalle;
END;
$$;


ALTER FUNCTION public.conciliar_caja_dia(p_fecha date) OWNER TO postgres;

--
-- Name: FUNCTION conciliar_caja_dia(p_fecha date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.conciliar_caja_dia(p_fecha date) IS 'Concilia la caja del día comparando saldo esperado vs real';


--
-- Name: crear_contrato_oficial(uuid, text, text, text, jsonb, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_cliente_id UUID;
    v_garantia_id UUID;
    v_contrato_id UUID;
    v_saldo_caja DECIMAL;
    v_monto_prestamo DECIMAL;
    v_usuario_id UUID;
    v_empresa_id UUID; -- ✅ NUEVO: Variable para empresa_id
BEGIN
    -- 1. VALIDACIÓN PREVIA + Obtener usuario/empresa de la caja
    v_monto_prestamo := (p_contrato_data->>'monto')::DECIMAL;
    
    -- Obtener el usuario_id de la caja operativa
    SELECT usuario_id INTO v_usuario_id
    FROM public.cajas_operativas
    WHERE id = p_caja_id;
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Caja no encontrada o sin usuario asignado: %', p_caja_id;
    END IF;

    -- ✅ Obtener empresa_id del usuario
    SELECT empresa_id INTO v_empresa_id
    FROM public.usuarios
    WHERE id = v_usuario_id;
    
    -- 2. GESTIÓN DE CLIENTE (Buscar o Crear)
    SELECT id INTO v_cliente_id 
    FROM public.clientes 
    WHERE numero_documento = p_cliente_doc_num;

    IF v_cliente_id IS NULL THEN
        INSERT INTO public.clientes (
            tipo_documento, numero_documento, nombres, 
            empresa_id
        ) VALUES (
            p_cliente_doc_tipo, p_cliente_doc_num, p_cliente_nombre, 
            v_empresa_id -- Usar variable ya obtenida
        ) RETURNING id INTO v_cliente_id;
    END IF;

    -- 3. CREAR GARANTÍA
    INSERT INTO public.garantias (
        cliente_id,
        descripcion,
        valor_tasacion,
        estado,
        categoria_id,
        fotos_urls,
        marca,
        modelo,
        serie,
        subcategoria,
        estado_bien
    ) VALUES (
        v_cliente_id,
        p_garantia_data->>'descripcion',
        (p_garantia_data->>'valor_tasacion')::DECIMAL,
        'custodia',
        NULL,
        (SELECT ARRAY(SELECT jsonb_array_elements_text(p_garantia_data->'fotos'))),
        p_garantia_data->>'marca',
        p_garantia_data->>'modelo',
        p_garantia_data->>'serie',
        p_garantia_data->>'subcategoria',
        COALESCE(p_garantia_data->>'estado_bien', p_garantia_data->>'estado', 'BUENO')
    ) RETURNING id INTO v_garantia_id;

    -- 4. CREAR CONTRATO (✅ AHORA CON empresa_id)
    INSERT INTO public.creditos (
        codigo,
        cliente_id,
        garantia_id,
        caja_origen_id,
        monto_prestado,
        tasa_interes,
        periodo_dias,
        fecha_vencimiento,
        saldo_pendiente,
        estado,
        estado_detallado,
        empresa_id -- ✅ Campo nuevo insertado
    ) VALUES (
        'CON-' || substr(md5(random()::text), 1, 6),
        v_cliente_id,
        v_garantia_id,
        p_caja_id,
        v_monto_prestamo,
        (p_contrato_data->>'interes')::DECIMAL,
        (p_contrato_data->>'dias')::INT,
        (p_contrato_data->>'fecha_venc')::DATE,
        v_monto_prestamo,
        'vigente',
        'vigente',
        v_empresa_id -- ✅ Valor insertado
    ) RETURNING id INTO v_contrato_id;

    -- 5. MOVER EL DINERO (El Ledger)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        referencia_id,
        descripcion,
        usuario_id
    ) VALUES (
        p_caja_id,
        'EGRESO',
        'PRESTAMO',
        v_monto_prestamo,
        0,
        0 - v_monto_prestamo,
        v_contrato_id,
        'Desembolso contrato para ' || p_cliente_nombre,
        v_usuario_id
    );

    RETURN v_contrato_id;
END;
$$;


ALTER FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) OWNER TO postgres;

--
-- Name: FUNCTION crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) IS 'Versión 3.1: Actualizada para incluir campos detallados de garantías (marca, modelo, serie, subcategoria, estado_bien)';


--
-- Name: crear_credito_completo(uuid, numeric, numeric, numeric, integer, timestamp with time zone, text, text[], text, uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text DEFAULT NULL::text, p_usuario_id uuid DEFAULT NULL::uuid, p_caja_id uuid DEFAULT NULL::uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_credito_id UUID;
    v_garantia_id UUID;
    v_codigo_credito TEXT;
    v_interes NUMERIC;
    v_total_pagar NUMERIC;
    v_fecha_vencimiento TIMESTAMPTZ;
    v_saldo_caja NUMERIC;
    v_es_desembolso_inmediato BOOLEAN;
BEGIN
    -- ========================================
    -- VALIDACIONES
    -- ========================================
    
    -- 1. Monto mínimo y máximo (ACTUALIZADO: S/10)
    IF p_monto_prestamo < 10 THEN
        RAISE EXCEPTION 'El monto mínimo de préstamo es S/10';
    END IF;
    
    IF p_monto_prestamo > 50000 THEN
        RAISE EXCEPTION 'El monto máximo de préstamo es S/50,000. Contacte a gerencia.';
    END IF;
    
    -- 3. Tasa de interés válida
    IF p_tasa_interes < 1 OR p_tasa_interes > 50 THEN
        RAISE EXCEPTION 'La tasa de interés debe estar entre 1%% y 50%%';
    END IF;
    
    -- 4. Verificar que el cliente exista
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE id = p_cliente_id) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    
    -- ========================================
    -- CÁLCULOS
    -- ========================================
    v_interes := p_monto_prestamo * (p_tasa_interes / 100);
    v_total_pagar := p_monto_prestamo + v_interes;
    v_fecha_vencimiento := p_fecha_inicio + (p_periodo_dias || ' days')::INTERVAL;
    
    -- Generar código único
    v_codigo_credito := 'JT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Verificar caja si se proporciona
    v_es_desembolso_inmediato := FALSE;
    IF p_caja_id IS NOT NULL THEN
        SELECT saldo_actual INTO v_saldo_caja
        FROM cajas_operativas
        WHERE id = p_caja_id AND estado = 'abierta';
        
        IF FOUND AND v_saldo_caja >= p_monto_prestamo THEN
            v_es_desembolso_inmediato := TRUE;
        END IF;
    END IF;
    
    -- ========================================
    -- INSERT CRÉDITO
    -- ========================================
    INSERT INTO creditos (
        cliente_id,
        codigo,           -- FIX: Added this column
        codigo_credito,
        monto_prestado,
        tasa_interes,
        interes_acumulado,
        saldo_pendiente,
        fecha_inicio,
        fecha_vencimiento,
        fecha_desembolso,
        periodo_dias,
        estado,
        estado_detallado,
        observaciones
    ) VALUES (
        p_cliente_id,
        v_codigo_credito, -- FIX: Value for codigo
        v_codigo_credito,
        p_monto_prestamo,
        p_tasa_interes,
        v_interes,
        v_total_pagar,
        p_fecha_inicio,
        v_fecha_vencimiento,
        CASE WHEN v_es_desembolso_inmediato THEN p_fecha_inicio ELSE NULL END,
        p_periodo_dias,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'pendiente' END,
        CASE WHEN v_es_desembolso_inmediato THEN 'vigente' ELSE 'aprobado' END,
        p_observaciones
    )
    RETURNING id INTO v_credito_id;
    
    -- ========================================
    -- INSERT GARANTÍA
    -- ========================================
    INSERT INTO garantias (
        credito_id,
        descripcion,
        valor_tasacion,
        estado,
        fotos
    ) VALUES (
        v_credito_id,
        p_descripcion_garantia,
        p_valor_tasacion,
        'custodia_caja',
        p_fotos
    )
    RETURNING id INTO v_garantia_id;
    
    -- Actualizar crédito con referencia a garantía
    UPDATE creditos SET garantia_id = v_garantia_id WHERE id = v_credito_id;
    
    -- ========================================
    -- MOVIMIENTO DE CAJA (si aplica)
    -- ========================================
    IF v_es_desembolso_inmediato THEN
        INSERT INTO movimientos_caja_operativa (
            caja_operativa_id,
            tipo,
            motivo,
            monto,
            referencia_id,
            descripcion,
            usuario_id,
            saldo_anterior,
            saldo_nuevo
        ) VALUES (
            p_caja_id,
            'EGRESO',
            'DESEMBOLSO_EMPENO',
            p_monto_prestamo,
            v_credito_id,
            'Desembolso Crédito #' || v_codigo_credito,
            p_usuario_id,
            v_saldo_caja,
            v_saldo_caja - p_monto_prestamo
        );
        
        -- Actualizar saldo de caja
        UPDATE cajas_operativas 
        SET saldo_actual = saldo_actual - p_monto_prestamo
        WHERE id = p_caja_id;
    END IF;
    
    -- ========================================
    -- RETORNO
    -- ========================================
    RETURN json_build_object(
        'success', TRUE,
        'creditoId', v_credito_id,
        'garantiaId', v_garantia_id,
        'codigo', v_codigo_credito,
        'estado', CASE WHEN v_es_desembolso_inmediato THEN 'DESEMBOLSADO' ELSE 'PENDIENTE_CAJA' END,
        'monto', p_monto_prestamo,
        'valorTasacion', p_valor_tasacion,
        'tasaInteres', p_tasa_interes,
        'interes', v_interes,
        'totalPagar', v_total_pagar,
        'fechaVencimiento', v_fecha_vencimiento,
        'mensaje', CASE WHEN v_es_desembolso_inmediato 
            THEN '¡Crédito desembolsado!' 
            ELSE 'Crédito aprobado (pendiente desembolso)' 
        END
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback automático por la transacción
        RAISE EXCEPTION 'Error al crear crédito: %', SQLERRM;
END;
$$;


ALTER FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid) IS 'Crea un crédito con garantía de forma atómica. Incluye validaciones de límites y tasa.';


--
-- Name: detectar_actividad_sospechosa(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detectar_actividad_sospechosa() RETURNS TABLE(alerta character varying, empleado_id uuid, empleado_nombre text, acciones_count bigint, ultima_accion timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Alerta: Más de 50 transacciones en 1 hora
    RETURN QUERY
    SELECT 
        'VOLUMEN_ALTO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.timestamp > now() - interval '1 hour'
    GROUP BY a.empleado_id, e.nombre_completo
    HAVING COUNT(*) > 50;
    
    -- Alerta: Eliminaciones fuera de horario (9pm-6am)
    RETURN QUERY
    SELECT 
        'DELETE_FUERA_HORARIO' as alerta,
        a.empleado_id,
        e.nombre_completo,
        COUNT(*) as acciones_count,
        MAX(a.timestamp) as ultima_accion
    FROM public.auditoria_transacciones a
    JOIN public.empleados_completo e ON a.empleado_id = e.id
    WHERE a.accion = 'DELETE'
      AND a.timestamp > now() - interval '24 hours'
      AND (EXTRACT(HOUR FROM a.timestamp) > 21 OR EXTRACT(HOUR FROM a.timestamp) < 6)
    GROUP BY a.empleado_id, e.nombre_completo;
END;
$$;


ALTER FUNCTION public.detectar_actividad_sospechosa() OWNER TO postgres;

--
-- Name: FUNCTION detectar_actividad_sospechosa(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.detectar_actividad_sospechosa() IS 'Detecta patrones anómalos que podrían indicar fraude';


--
-- Name: detectar_descuadres(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detectar_descuadres(p_ultimos_dias integer DEFAULT 7) RETURNS TABLE(fecha date, diferencia numeric, saldo_esperado numeric, saldo_real numeric, caja_id uuid, cajero_nombre text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(c.fecha_cierre) as fecha,
        (c.saldo_final_efectivo - 
            (c.saldo_inicial_efectivo + 
             COALESCE(ingresos.total, 0) - 
             COALESCE(egresos.total, 0)
            )
        ) as diferencia,
        (c.saldo_inicial_efectivo + 
         COALESCE(ingresos.total, 0) - 
         COALESCE(egresos.total, 0)
        ) as saldo_esperado,
        c.saldo_final_efectivo as saldo_real,
        c.id as caja_id,
        COALESCE(e.nombre_completo, 'Desconocido') as cajero_nombre
    FROM cajas c
    LEFT JOIN empleados_completo e ON c.usuario_id = e.user_id
    LEFT JOIN LATERAL (
        SELECT SUM(monto) as total
        FROM pagos
        WHERE DATE(fecha_pago) = DATE(c.fecha_cierre)
    ) ingresos ON true
    LEFT JOIN LATERAL (
        SELECT SUM(monto_prestado) as total
        FROM creditos
        WHERE DATE(fecha_desembolso) = DATE(c.fecha_cierre)
    ) egresos ON true
    WHERE c.estado = 'cerrada'
      AND DATE(c.fecha_cierre) >= CURRENT_DATE - p_ultimos_dias
      AND ABS(c.saldo_final_efectivo - 
              (c.saldo_inicial_efectivo + 
               COALESCE(ingresos.total, 0) - 
               COALESCE(egresos.total, 0)
              )
          ) > 0.01
    ORDER BY c.fecha_cierre DESC;
END;
$$;


ALTER FUNCTION public.detectar_descuadres(p_ultimos_dias integer) OWNER TO postgres;

--
-- Name: FUNCTION detectar_descuadres(p_ultimos_dias integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.detectar_descuadres(p_ultimos_dias integer) IS 'Detecta cajas con descuadres en los últimos N días';


--
-- Name: fn_audit_metadata_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_audit_metadata_changes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_usuario UUID;
BEGIN
    -- Solo actuar si metadata cambió
    IF OLD.metadata IS DISTINCT FROM NEW.metadata THEN
        -- Intentar obtener usuario actual
        BEGIN
            v_usuario := auth.uid();
        EXCEPTION WHEN OTHERS THEN
            v_usuario := NULL;
        END;
        
        -- Registrar en audit_log
        INSERT INTO public.audit_log (
            tabla,
            registro_id,
            accion,
            usuario_id,
            datos_anteriores,
            datos_nuevos,
            metadata
        ) VALUES (
            'transacciones_capital',
            OLD.id,
            'METADATA_CHANGE',
            v_usuario,
            jsonb_build_object(
                'metadata', OLD.metadata,
                'descripcion', OLD.descripcion
            ),
            jsonb_build_object(
                'metadata', NEW.metadata,
                'descripcion', NEW.descripcion
            ),
            jsonb_build_object(
                'ip', inet_client_addr(),
                'timestamp', NOW(),
                'reason', 'Cambio detectado en campo metadata del ledger'
            )
        );
        
        RAISE NOTICE 'AUDIT: Cambio de metadata en transaccion % registrado', OLD.id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_audit_metadata_changes() OWNER TO postgres;

--
-- Name: FUNCTION fn_audit_metadata_changes(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_audit_metadata_changes() IS 'Captura cambios en metadata de transacciones_capital para auditoría completa.
Cierra el gap donde Smart Lock permite editar metadata pero no se auditaba.';


--
-- Name: fn_liquidar_caja_cerrada(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_liquidar_caja_cerrada() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_boveda_principal_id UUID;
BEGIN
    -- Solo actuar cuando pasa de abierta -> cerrada
    IF OLD.estado = 'abierta' AND NEW.estado = 'cerrada' THEN
        
        -- 1. Buscar Bóveda Principal (Destino del dinero)
        SELECT id INTO v_boveda_principal_id 
        FROM public.cuentas_financieras 
        WHERE es_principal = TRUE 
        LIMIT 1;

        IF v_boveda_principal_id IS NULL THEN
            RAISE EXCEPTION 'ERROR CRÍTICO: No existe Bóveda Principal para recibir la liquidación de caja.';
        END IF;

        -- 2. Crear Transacción de Retorno (CIERRE_CAJA)
        -- Esto disparará el trigger de actualización de saldo en la Bóveda.
        INSERT INTO public.transacciones_capital (
            tipo,
            monto,
            descripcion,
            destino_cuenta_id, -- El dinero entra a la Bóveda
            origen_cuenta_id,  -- NULL (Viene de una entidad operativa externa al ledger financiero)
            metadata,
            created_by
        ) VALUES (
            'CIERRE_CAJA',
            COALESCE(NEW.saldo_final_cierre, 0), -- Asumimos que lo físico es lo que se entrega
            'Liquidación Automática Caja #' || NEW.numero_caja,
            v_boveda_principal_id,
            NULL,
            jsonb_build_object(
                'caja_operativa_id', NEW.id,
                'cajero_id', NEW.usuario_id,
                'diferencia', NEW.diferencia_cierre
            ),
            auth.uid() -- Si lo dispara un RPC, auth.uid() debería estar presente
        );
        
        RAISE NOTICE '📦 Caja % liquidada. S/ % retornados a Bóveda.', NEW.numero_caja, NEW.saldo_final_cierre;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_liquidar_caja_cerrada() OWNER TO postgres;

--
-- Name: fn_protect_ledger_integrity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_protect_ledger_integrity() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- A. DELETE (Destrucción de Evidencia) -> PROHIBIDO TOTALMENTE
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'ELIMINACIÓN PROHIBIDA: El ledger financiero es inmutable. Para corregir, genere una contra-transacción.';
    END IF;

    -- B. UPDATE (Edición) -> SELECTIVO
    IF TG_OP = 'UPDATE' THEN
        -- Verificamos si se intentó tocar campos "Sagrados"
        -- Usamos IS DISTINCT FROM para manejar NULLs correctamente si los hubiera
        IF OLD.monto <> NEW.monto OR
           OLD.origen_cuenta_id IS DISTINCT FROM NEW.origen_cuenta_id OR
           OLD.destino_cuenta_id IS DISTINCT FROM NEW.destino_cuenta_id OR
           OLD.tipo <> NEW.tipo OR
           OLD.fecha_operacion <> NEW.fecha_operacion THEN
            
            RAISE EXCEPTION 'MODIFICACIÓN FINANCIERA PROHIBIDA: No puede alterar montos, fechas o cuentas. Genere una contra-transacción.';
        END IF;

        -- Si llegamos aquí, es porque solo tocó campos permitidos (descripcion, metadata, evidencia_ref)
        -- Permitimos pasar.
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_protect_ledger_integrity() OWNER TO postgres;

--
-- Name: FUNCTION fn_protect_ledger_integrity(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_protect_ledger_integrity() IS 'Guardián del Ledger: Bloquea ediciones financieras y borrados, permite notas.';


--
-- Name: fn_update_caja_operativa_saldo(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_caja_operativa_saldo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    factor NUMERIC := 1;
BEGIN
    -- Determinar signo según tipo de movimiento
    -- Asumiendo tipos estandar: 'INGRESO', 'EGRESO', 'GASTO', 'APERTURA'
    IF NEW.tipo IN ('EGRESO', 'GASTO', 'RETIRO', 'DEVOLUCION') THEN
        factor := -1;
    END IF;

    UPDATE public.cajas_operativas
    SET saldo_actual = saldo_actual + (NEW.monto * factor),
        _modified = NOW()
    WHERE id = NEW.caja_operativa_id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_caja_operativa_saldo() OWNER TO postgres;

--
-- Name: fn_update_contratos_fondeo_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_contratos_fondeo_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_contratos_fondeo_timestamp() OWNER TO postgres;

--
-- Name: fn_update_cuentas_financieras_saldo(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_cuentas_financieras_saldo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Caso: SALIDA DE DINERO (Origen)
    IF NEW.origen_cuenta_id IS NOT NULL THEN
        UPDATE public.cuentas_financieras
        SET saldo = saldo - NEW.monto,
            updated_at = NOW()
        WHERE id = NEW.origen_cuenta_id;
    END IF;

    -- Caso: ENTRADA DE DINERO (Destino)
    IF NEW.destino_cuenta_id IS NOT NULL THEN
        UPDATE public.cuentas_financieras
        SET saldo = saldo + NEW.monto,
            updated_at = NOW()
        WHERE id = NEW.destino_cuenta_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_update_cuentas_financieras_saldo() OWNER TO postgres;

--
-- Name: FUNCTION fn_update_cuentas_financieras_saldo(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.fn_update_cuentas_financieras_saldo() IS 'Actualiza automáticamente saldos de tesorería (Origen/Destino).';


--
-- Name: generar_reporte_cierre(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generar_reporte_cierre(p_fecha date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_reporte JSONB;
BEGIN
    SELECT jsonb_build_object(
        'fecha', p_fecha,
        'resumen', (
            SELECT jsonb_build_object(
                'prestamos', jsonb_build_object(
                    'cantidad', COUNT(*),
                    'monto_total', COALESCE(SUM(monto_prestado), 0)
                ),
                'pagos', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto), 0)
                    )
                    FROM pagos
                    WHERE DATE(fecha_pago) = p_fecha
                ),
                'renovaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*),
                        'monto_total', COALESCE(SUM(monto_prestado), 0)
                    )
                    FROM creditos
                    WHERE DATE(fecha_desembolso) = p_fecha
                      AND estado = 'renovado'
                ),
                'cancelaciones', (
                    SELECT jsonb_build_object(
                        'cantidad', COUNT(*)
                    )
                    FROM creditos
                    WHERE DATE(fecha_cancelacion) = p_fecha
                      AND estado = 'cancelado'
                )
            )
            FROM creditos
            WHERE DATE(fecha_desembolso) = p_fecha
        ),
        'conciliacion', (
            SELECT row_to_json(r)
            FROM (SELECT * FROM public.conciliar_caja_dia(p_fecha)) r
        )
    ) INTO v_reporte;
    
    RETURN v_reporte;
END;
$$;


ALTER FUNCTION public.generar_reporte_cierre(p_fecha date) OWNER TO postgres;

--
-- Name: FUNCTION generar_reporte_cierre(p_fecha date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.generar_reporte_cierre(p_fecha date) IS 'Genera un reporte JSON completo del cierre del día';


--
-- Name: get_actividad_empleado(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_actividad_empleado(p_empleado_id uuid, p_limit integer DEFAULT 50) RETURNS TABLE(created_at timestamp with time zone, accion character varying, tabla character varying, registro_id uuid, descripcion text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.timestamp as created_at,
        a.accion,
        a.tabla_afectada as tabla,
        a.registro_id,
        CASE a.tabla_afectada
            WHEN 'creditos' THEN 'Contrato de empeño'
            WHEN 'pagos' THEN 'Registro de pago'
            WHEN 'garantias' THEN 'Bien en custodia'
            WHEN 'cajas' THEN 'Operación de caja'
            ELSE a.tabla_afectada
        END as descripcion
    FROM public.auditoria_transacciones a
    WHERE a.empleado_id = p_empleado_id
    ORDER BY a.timestamp DESC
    LIMIT p_limit;
END;
$$;


ALTER FUNCTION public.get_actividad_empleado(p_empleado_id uuid, p_limit integer) OWNER TO postgres;

--
-- Name: get_auditoria_registro(character varying, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) RETURNS TABLE(audit_id uuid, accion character varying, empleado_nombre text, datos_antes jsonb, datos_despues jsonb, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id as audit_id,
        a.accion,
        COALESCE(
            (SELECT nombre_completo FROM empleados_completo WHERE id = a.empleado_id),
            'Sistema'
        ) as empleado_nombre,
        a.datos_antes,
        a.datos_despues,
        a.timestamp as created_at
    FROM public.auditoria_transacciones a
    WHERE a.tabla_afectada = p_tabla
      AND a.registro_id = p_registro_id
    ORDER BY a.timestamp DESC;
END;
$$;


ALTER FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_auditoria_registro(p_tabla character varying, p_registro_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) IS 'Historial de cambios de un registro específico';


--
-- Name: get_cartera_risk_summary(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_cartera_risk_summary() RETURNS TABLE(estado_grupo text, cantidad bigint, total_saldo numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento > CURRENT_DATE + 7 THEN 'VIGENTE'
            WHEN c.estado = 'vigente' AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + 7 THEN 'POR_VENCER'
            WHEN c.estado = 'vencido' OR c.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
            ELSE 'OTROS'
        END as estado_grupo,
        COUNT(*) as cantidad,
        COALESCE(SUM(c.saldo_pendiente), 0) as total_saldo
    FROM public.creditos c
    WHERE c.estado NOT IN ('cancelado', 'anulado')
    GROUP BY 1;
END;
$$;


ALTER FUNCTION public.get_cartera_risk_summary() OWNER TO postgres;

--
-- Name: FUNCTION get_cartera_risk_summary(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_cartera_risk_summary() IS 'Retorna resumen de riesgo de cartera para dashboard';


--
-- Name: get_contratos_renovables(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_contratos_renovables(p_dias integer DEFAULT 30) RETURNS TABLE(id uuid, codigo character varying, cliente_id uuid, cliente_nombre text, cliente_telefono character varying, fecha_vencimiento date, fecha_creacion timestamp without time zone, dias_restantes integer, dias_transcurridos integer, monto_prestado numeric, tasa_interes numeric, interes_acumulado numeric, saldo_pendiente numeric, garantia_descripcion text, urgencia text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        c.cliente_id,
        cl.nombre_completo,
        cl.telefono_principal,
        c.fecha_vencimiento,
        c.created_at as fecha_creacion,                               -- NUEVO
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        GREATEST(1, EXTRACT(DAY FROM NOW() - c.created_at)::int) as dias_transcurridos,  -- NUEVO
        c.monto_prestado,
        c.tasa_interes,                                               -- NUEVO
        c.interes_acumulado,
        c.saldo_pendiente,
        g.descripcion as garantia_descripcion,
        CASE
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 3 THEN 'alta'
            WHEN c.fecha_vencimiento - CURRENT_DATE <= 7 THEN 'media'
            ELSE 'baja'
        END as urgencia
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    JOIN public.garantias g ON c.garantia_id = g.id
    WHERE
        c.estado = 'vigente'
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + p_dias
    ORDER BY c.fecha_vencimiento ASC;
END;
$$;


ALTER FUNCTION public.get_contratos_renovables(p_dias integer) OWNER TO postgres;

--
-- Name: FUNCTION get_contratos_renovables(p_dias integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_contratos_renovables(p_dias integer) IS 'Retorna contratos próximos a vencer con campos para sistema de interés flexible (tasa_interes, dias_transcurridos)';


--
-- Name: get_contratos_vencimientos(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_contratos_vencimientos(p_dias integer DEFAULT 30) RETURNS TABLE(id uuid, codigo text, cliente_id uuid, cliente text, dni text, telefono text, monto numeric, saldo numeric, fecha_vencimiento date, dias_restantes integer)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.codigo::TEXT,
        cl.id,
        cl.nombre_completo::TEXT,
        cl.numero_documento::TEXT as dni,
        cl.telefono_principal::TEXT,
        c.monto_prestado,
        c.saldo_pendiente,
        c.fecha_vencimiento::DATE,
        (c.fecha_vencimiento::DATE - CURRENT_DATE)::INTEGER as dias_restantes
    FROM creditos c
    JOIN clientes_completo cl ON c.cliente_id = cl.id
    WHERE c.fecha_vencimiento::DATE >= CURRENT_DATE
      AND c.fecha_vencimiento::DATE <= CURRENT_DATE + p_dias
      AND (c.estado_detallado = 'vigente' OR c.estado_detallado = 'al_dia' OR c.estado_detallado = 'por_vencer')
    ORDER BY c.fecha_vencimiento ASC;
END;
$$;


ALTER FUNCTION public.get_contratos_vencimientos(p_dias integer) OWNER TO postgres;

--
-- Name: FUNCTION get_contratos_vencimientos(p_dias integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_contratos_vencimientos(p_dias integer) IS 'Obtiene contratos que vencen en los próximos N días con DNI del cliente';


--
-- Name: get_historial_notificaciones(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_historial_notificaciones(p_credito_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', id,
                'tipo', tipo_notificacion,
                'mensaje', LEFT(mensaje_enviado, 100) || '...', -- Solo primeros 100 caracteres
                'fecha', fecha_envio,
                'estado', estado,
                'medio', medio,
                'horas_transcurridas', EXTRACT(EPOCH FROM (NOW() - fecha_envio)) / 3600
            ) ORDER BY fecha_envio DESC
        )
        FROM notificaciones_enviadas
        WHERE credito_id = p_credito_id
        LIMIT 10
    );
END;
$$;


ALTER FUNCTION public.get_historial_notificaciones(p_credito_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION get_historial_notificaciones(p_credito_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_historial_notificaciones(p_credito_id uuid) IS 'Obtiene el historial de notificaciones de un contrato';


--
-- Name: get_movimientos_dia(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_movimientos_dia(p_fecha date) RETURNS TABLE(tipo_movimiento character varying, categoria character varying, cantidad_operaciones bigint, monto_total numeric, monto_promedio numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    -- 1. Préstamos otorgados (egresos de caja)
    SELECT 
        'PRESTAMO'::VARCHAR as tipo_movimiento,
        'EGRESO'::VARCHAR as categoria,
        COUNT(*) as cantidad_operaciones,
        SUM(monto_prestado) as monto_total,
        AVG(monto_prestado) as monto_promedio
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
    
    UNION ALL
    
    -- 2. Pagos recibidos (ingresos a caja)
    SELECT 
        'PAGO',
        'INGRESO',
        COUNT(*),
        SUM(monto),
        AVG(monto)
    FROM pagos
    WHERE DATE(fecha_pago) = p_fecha
      AND estado = 'completado'
    
    UNION ALL
    
    -- 3. Renovaciones (ingreso + egreso)
    SELECT 
        'RENOVACION',
        'MIXTO',
        COUNT(*),
        SUM(monto_prestado),
        AVG(monto_prestado)
    FROM creditos
    WHERE DATE(fecha_desembolso) = p_fecha
      AND estado = 'renovado'
    
    UNION ALL
    
    -- 4. Cancelaciones (ingreso final)
    SELECT 
        'CANCELACION',
        'INGRESO',
        COUNT(*),
        SUM(p.monto),
        AVG(p.monto)
    FROM pagos p
    JOIN creditos c ON p.credito_id = c.id
    WHERE DATE(p.fecha_pago) = p_fecha
      AND c.estado = 'cancelado'
      AND DATE(c.fecha_cancelacion) = p_fecha;
END;
$$;


ALTER FUNCTION public.get_movimientos_dia(p_fecha date) OWNER TO postgres;

--
-- Name: FUNCTION get_movimientos_dia(p_fecha date); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_movimientos_dia(p_fecha date) IS 'Obtiene todos los movimientos financieros de un día específico';


--
-- Name: get_or_create_persona(character varying, character varying, character varying, character varying, character varying, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying DEFAULT NULL::character varying, p_email character varying DEFAULT NULL::character varying, p_direccion text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_persona_id UUID;
BEGIN
    -- Intentar encontrar persona existente
    SELECT id INTO v_persona_id
    FROM public.personas
    WHERE numero_documento = p_numero_documento;
    
    -- Si no existe, crearla
    IF v_persona_id IS NULL THEN
        INSERT INTO public.personas (
            tipo_documento,
            numero_documento,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono_principal,
            email,
            direccion
        ) VALUES (
            p_tipo_documento,
            p_numero_documento,
            p_nombres,
            p_apellido_paterno,
            p_apellido_materno,
            p_telefono,
            p_email,
            p_direccion
        ) RETURNING id INTO v_persona_id;
    END IF;
    
    RETURN v_persona_id;
END;
$$;


ALTER FUNCTION public.get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying, p_email character varying, p_direccion text) OWNER TO postgres;

--
-- Name: get_saldo_caja_efectivo(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_saldo_caja_efectivo(p_caja_id uuid) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_saldo_inicial NUMERIC;
    v_movimientos NUMERIC;
BEGIN
    SELECT COALESCE(saldo_inicial, 0) INTO v_saldo_inicial
    FROM public.cajas_operativas WHERE id = p_caja_id;
    
    SELECT COALESCE(SUM(
        CASE 
            WHEN anulado = TRUE THEN 0  -- Ignorar anulados
            WHEN tipo = 'INGRESO' THEN monto 
            ELSE -monto 
        END
    ), 0) INTO v_movimientos
    FROM public.movimientos_caja_operativa
    WHERE (caja_operativa_id = p_caja_id OR caja_id = p_caja_id);
    
    RETURN v_saldo_inicial + v_movimientos;
END;
$$;


ALTER FUNCTION public.get_saldo_caja_efectivo(p_caja_id uuid) OWNER TO postgres;

--
-- Name: get_upcoming_expirations(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_upcoming_expirations(p_days integer DEFAULT 7) RETURNS TABLE(id uuid, codigo character varying, cliente_nombre text, garantia_descripcion text, garantia_foto text, fecha_vencimiento date, dias_restantes integer, monto_prestamo numeric, telefono character varying)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.codigo,
        cl.nombre_completo as cliente_nombre,
        -- Obtenemos la primera garantía asociada si hay varias
        COALESCE(g.descripcion, 'Sin descripción') as garantia_descripcion,
        (g.fotos_urls)[1] as garantia_foto,
        c.fecha_vencimiento,
        (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
        c.monto_prestado,
        cl.telefono_principal as telefono
    FROM public.creditos c
    JOIN public.clientes_completo cl ON c.cliente_id = cl.id
    -- JOIN corregido: Garantía apunta al Crédito
    LEFT JOIN public.garantias g ON g.credito_id = c.id
    WHERE
        c.estado IN ('vigente', 'vencido')
        AND c.fecha_vencimiento BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE + p_days
    ORDER BY c.fecha_vencimiento ASC
    LIMIT 20;
END;
$$;


ALTER FUNCTION public.get_upcoming_expirations(p_days integer) OWNER TO postgres;

--
-- Name: FUNCTION get_upcoming_expirations(p_days integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_upcoming_expirations(p_days integer) IS 'Retorna próximos vencimientos para timeline';


--
-- Name: get_user_role(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_user_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_role text;
BEGIN
  -- Opción A: Leer de Custom Claims (Más rápido, requiere auth hook)
  -- Opción B: Leer de tabla usuarios (Más lento pero sin configuración extra)
  SELECT rol::text INTO v_role FROM public.usuarios WHERE id = auth.uid();
  RETURN v_role;
END;
$$;


ALTER FUNCTION public.get_user_role() OWNER TO postgres;

--
-- Name: get_vencimientos_agrupados(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_vencimientos_agrupados() RETURNS TABLE(periodo text, cantidad bigint, contratos jsonb)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH vencimientos AS (
        SELECT
            c.id,
            c.codigo,
            cl.nombre_completo as cliente,
            cl.telefono_principal as telefono,
            c.fecha_vencimiento,
            c.monto_prestado,
            c.saldo_pendiente,
            (c.fecha_vencimiento - CURRENT_DATE)::int as dias_restantes,
            CASE
                WHEN c.fecha_vencimiento = CURRENT_DATE THEN 'hoy'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 1 AND CURRENT_DATE + 7 THEN 'semana'
                WHEN c.fecha_vencimiento BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 30 THEN 'mes'
                ELSE 'futuro'
            END as periodo_grupo
        FROM public.creditos c
        JOIN public.clientes_completo cl ON c.cliente_id = cl.id
        WHERE c.estado = 'vigente'
          AND c.fecha_vencimiento >= CURRENT_DATE
    )
    SELECT
        v.periodo_grupo as periodo,
        COUNT(*)::bigint as cantidad,
        jsonb_agg(
            jsonb_build_object(
                'id', v.id,
                'codigo', v.codigo,
                'cliente', v.cliente,
                'telefono', v.telefono,
                'fechaVencimiento', v.fecha_vencimiento,
                'diasRestantes', v.dias_restantes,
                'monto', v.monto_prestado,
                'saldo', v.saldo_pendiente
            ) ORDER BY v.fecha_vencimiento
        ) as contratos
    FROM vencimientos v
    GROUP BY v.periodo_grupo
    ORDER BY 
        CASE v.periodo_grupo
            WHEN 'hoy' THEN 1
            WHEN 'semana' THEN 2
            WHEN 'mes' THEN 3
            ELSE 4
        END;
END;
$$;


ALTER FUNCTION public.get_vencimientos_agrupados() OWNER TO postgres;

--
-- Name: FUNCTION get_vencimientos_agrupados(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.get_vencimientos_agrupados() IS 'Retorna vencimientos agrupados por período (hoy/semana/mes)';


--
-- Name: job_actualizar_estados_creditos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.job_actualizar_estados_creditos() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Esto dispara el trigger de _modified para cada registro
    -- y también los triggers de estado automático
    UPDATE creditos 
    SET _modified = NOW() 
    WHERE estado IN ('vigente', 'vencido', 'en_mora')
      AND fecha_vencimiento < CURRENT_DATE;
END;
$$;


ALTER FUNCTION public.job_actualizar_estados_creditos() OWNER TO postgres;

--
-- Name: limpiar_codigos_expirados(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limpiar_codigos_expirados() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    DELETE FROM verificacion_whatsapp
    WHERE expira_en < NOW() - INTERVAL '1 hour';
END;
$$;


ALTER FUNCTION public.limpiar_codigos_expirados() OWNER TO postgres;

--
-- Name: obtener_resumen_rendimientos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.obtener_resumen_rendimientos() RETURNS TABLE(total_capital_activo numeric, total_rendimientos_devengados numeric, total_rendimientos_pagados numeric, total_pendiente_pago numeric, contratos_activos bigint, inversionistas_activos bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(v.monto_pactado), 0)::NUMERIC AS total_capital_activo,
        COALESCE(SUM(v.rendimiento_devengado), 0)::NUMERIC AS total_rendimientos_devengados,
        COALESCE(SUM(v.monto_rendimientos_pagados), 0)::NUMERIC AS total_rendimientos_pagados,
        COALESCE(SUM(v.rendimiento_pendiente_pago), 0)::NUMERIC AS total_pendiente_pago,
        COUNT(DISTINCT v.contrato_id) AS contratos_activos,
        COUNT(DISTINCT v.inversionista_id) AS inversionistas_activos
    FROM public.vista_rendimientos_inversionistas v;
END;
$$;


ALTER FUNCTION public.obtener_resumen_rendimientos() OWNER TO postgres;

--
-- Name: procesar_pago_trigger_fn(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.procesar_pago_trigger_fn() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
    v_monto_decimal DECIMAL;
BEGIN
    -- Evitar recursión si ya se procesó (usando un flag en metadata o checkeando movimientos)
    -- En este caso, asumimos que todo INSERT a pagos debe procesarse si viene de cliente (usuario_id not null)
    
    -- Convertir monto a decimal (monto puede venir como string o numeric)
    -- Usamos CASE para manejar ambos tipos correctamente
    IF NEW.monto IS NOT NULL THEN
        v_monto_decimal := NEW.monto::DECIMAL;
    ELSIF NEW.monto_total IS NOT NULL THEN
        v_monto_decimal := NEW.monto_total;
    ELSE
        v_monto_decimal := 0;
    END IF;

    -- Actualizar el monto_total numérico si es nulo
    IF NEW.monto_total IS NULL THEN
        NEW.monto_total := v_monto_decimal;
    END IF;

    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = NEW.credito_id;

    IF NOT FOUND THEN
        -- Si no hay crédito, no podemos procesar lógica de negocio (ej. pago huerfano)
        RETURN NEW;
    END IF;

    -- 2. CALCULAR MONTOS Y ACTUALIZAR CRÉDITO (Estado)
    IF NEW.tipo = 'renovacion' THEN
        v_interes_pagado := v_monto_decimal;
        
        -- Extender vencimiento
        -- Usar periodo_dias o default 30
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (COALESCE(v_credito.periodo_dias, 30) || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0,
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Renovación (Sync). Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF NEW.tipo = 'desempeno' THEN
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := v_monto_decimal - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW(),
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        -- Liberar garantía
        UPDATE public.garantias 
        SET estado = 'devuelta',
            fecha_venta = NOW(),
            updated_at = NOW()
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Cancelación (Sync). Prenda devuelta.';
        
    ELSIF NEW.tipo = 'capital' OR NEW.tipo = 'interes' THEN
        -- Amortización parcial (simple)
        UPDATE public.creditos
        SET saldo_pendiente = saldo_pendiente - v_monto_decimal,
            updated_at = NOW()
        WHERE id = NEW.credito_id;
        
        v_mensaje := 'Pago parcial (Sync).';
    END IF;

    -- 3. INSERTAR MOVIMIENTO DE CAJA (Si no existe ya)
    -- Verificar si ya existe movimiento para este pago (idempotencia)
    IF NOT EXISTS (SELECT 1 FROM public.movimientos_caja_operativa WHERE referencia_id = NEW.credito_id AND fecha = NEW.created_at) THEN
        -- Obtener saldo caja
        SELECT saldo_actual INTO v_saldo_anterior 
        FROM public.cajas_operativas 
        WHERE id = NEW.caja_operativa_id;
        
        IF v_saldo_anterior IS NULL THEN v_saldo_anterior := 0; END IF;
        
        v_saldo_nuevo := v_saldo_anterior + v_monto_decimal;
        
        INSERT INTO public.movimientos_caja_operativa (
            caja_operativa_id, tipo, motivo, monto,
            saldo_anterior, saldo_nuevo,
            referencia_id, descripcion, metadata,
            usuario_id, fecha
        ) VALUES (
            NEW.caja_operativa_id, 'INGRESO', 
            CASE WHEN NEW.tipo = 'renovacion' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
            v_monto_decimal,
            v_saldo_anterior, v_saldo_nuevo,
            NEW.credito_id, v_mensaje, NEW.metadata,
            NEW.usuario_id, NEW.created_at -- Usar fecha del pago original
        );

        -- 4. ACTUALIZAR SALDO CAJA
        UPDATE public.cajas_operativas
        SET saldo_actual = v_saldo_nuevo
        WHERE id = NEW.caja_operativa_id;
    END IF;

    -- Actualizar campos derivados en el registro de pago actual
    NEW.desglose_capital := v_capital_pagado;
    NEW.desglose_interes := v_interes_pagado;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.procesar_pago_trigger_fn() OWNER TO postgres;

--
-- Name: proyectar_interes(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) RETURNS TABLE(dias_totales integer, interes_proyectado numeric, total_a_pagar numeric)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_monto NUMERIC;
    v_tasa NUMERIC;
    v_dias_actuales INT;
BEGIN
    -- Obtener datos del crédito
    SELECT 
        monto_prestado,
        tasa_interes,
        dias_transcurridos
    INTO v_monto, v_tasa, v_dias_actuales
    FROM public.creditos
    WHERE id = p_credito_id;
    
    IF v_monto IS NULL THEN
        RAISE EXCEPTION 'Crédito no encontrado: %', p_credito_id;
    END IF;
    
    -- Calcular proyección
    dias_totales := COALESCE(v_dias_actuales, 0) + p_dias_adicionales;
    
    interes_proyectado := ROUND(
        v_monto * (v_tasa / 100.0) * (dias_totales / 30.0),
        2
    );
    
    total_a_pagar := v_monto + interes_proyectado;
    
    RETURN NEXT;
END;
$$;


ALTER FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) OWNER TO postgres;

--
-- Name: FUNCTION proyectar_interes(p_credito_id uuid, p_dias_adicionales integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) IS 'Proyecta el interés futuro agregando días adicionales';


--
-- Name: puede_anular_movimiento(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_rol VARCHAR;
    v_mov_fecha TIMESTAMPTZ;
    v_horas_transcurridas NUMERIC;
BEGIN
    -- Obtener rol del usuario
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = p_usuario_id;
    
    -- Obtener fecha del movimiento
    SELECT fecha INTO v_mov_fecha 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_mov_fecha)) / 3600;
    
    -- Reglas por rol:
    -- Admin: puede anular cualquier cosa
    -- Gerente: puede anular hasta 7 días
    -- Cajero: solo puede anular del mismo día
    RETURN CASE
        WHEN v_rol IN ('admin', 'super_admin') THEN TRUE
        WHEN v_rol = 'gerente' AND v_horas_transcurridas <= 168 THEN TRUE  -- 7 días
        WHEN v_rol = 'cajero' AND v_horas_transcurridas <= 24 THEN TRUE   -- 1 día
        ELSE FALSE
    END;
END;
$$;


ALTER FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) IS 'Verifica permisos: Admin=todo, Gerente=7días, Cajero=mismo día';


--
-- Name: puede_enviar_notificacion(uuid, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric DEFAULT 4) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_ultima_notificacion TIMESTAMP;
    v_horas_transcurridas NUMERIC;
    v_puede_enviar BOOLEAN;
    v_mensaje TEXT;
BEGIN
    -- Obtener última notificación
    SELECT MAX(fecha_envio) INTO v_ultima_notificacion
    FROM notificaciones_enviadas
    WHERE credito_id = p_credito_id
    AND estado = 'enviado';
    
    -- Si no hay notificaciones previas
    IF v_ultima_notificacion IS NULL THEN
        RETURN json_build_object(
            'puede_enviar', true,
            'mensaje', 'No se han enviado notificaciones previas',
            'ultima_notificacion', null,
            'horas_transcurridas', null
        );
    END IF;
    
    -- Calcular horas transcurridas
    v_horas_transcurridas := EXTRACT(EPOCH FROM (NOW() - v_ultima_notificacion)) / 3600;
    
    -- Verificar si cumple el cooldown
    v_puede_enviar := v_horas_transcurridas >= p_horas_minimas;
    
    IF v_puede_enviar THEN
        v_mensaje := 'Puede enviar notificación';
    ELSE
        v_mensaje := format(
            'Espere %s horas más antes de enviar otro mensaje',
            ROUND(p_horas_minimas - v_horas_transcurridas, 1)
        );
    END IF;
    
    RETURN json_build_object(
        'puede_enviar', v_puede_enviar,
        'mensaje', v_mensaje,
        'ultima_notificacion', v_ultima_notificacion,
        'horas_transcurridas', ROUND(v_horas_transcurridas, 1)
    );
END;
$$;


ALTER FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric) OWNER TO postgres;

--
-- Name: FUNCTION puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric) IS 'Verifica si se puede enviar una notificación basado en cooldown';


--
-- Name: registrar_evento(character varying, uuid, character varying, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb DEFAULT '{}'::jsonb, p_usuario_id uuid DEFAULT NULL::uuid) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_version INT;
    v_evento_id BIGINT;
BEGIN
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.eventos_sistema
    WHERE agregado_tipo = p_agregado_tipo AND agregado_id = p_agregado_id;
    
    INSERT INTO public.eventos_sistema (
        agregado_tipo, agregado_id, evento_tipo, payload, version, usuario_id
    ) VALUES (
        p_agregado_tipo, p_agregado_id, p_evento_tipo, p_payload, v_version, p_usuario_id
    ) RETURNING id INTO v_evento_id;
    
    RETURN v_evento_id;
END;
$$;


ALTER FUNCTION public.registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb, p_usuario_id uuid) OWNER TO postgres;

--
-- Name: registrar_pago_oficial(uuid, uuid, numeric, text, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
BEGIN
    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- 2. LÓGICA SEGÚN TIPO DE OPERACIÓN
    IF p_tipo_operacion = 'RENOVACION' THEN
        -- Regla: Para renovar, debe cubrir al menos el interés acumulado
        v_interes_pagado := p_monto_pago;
        
        -- Extender vencimiento (usar el periodo original del crédito)
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (v_credito.periodo_dias || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0, -- Resetear interés acumulado
            estado = 'vigente' -- Si estaba vencido, revive
        WHERE id = p_credito_id;
        
        v_mensaje := 'Renovación exitosa. Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF p_tipo_operacion = 'DESEMPENO' THEN
        -- Regla: Debe cubrir Todo (Capital + Interés)
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := p_monto_pago - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW()
        WHERE id = p_credito_id;
        
        -- Liberar garantía automáticamente
        UPDATE public.garantias 
        SET estado = 'liberada' 
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Crédito cancelado y prenda liberada.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 3. REGISTRAR EL PAGO (Historial)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total, 
        desglose_capital, desglose_interes, medio_pago, metadata
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado, p_metodo_pago, p_metadata
    );

    -- 4. OBTENER SALDO ACTUAL DE CAJA Y CALCULAR NUEVO
    SELECT saldo_actual INTO v_saldo_anterior 
    FROM public.cajas_operativas 
    WHERE id = p_caja_id;
    
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata
    ) VALUES (
        p_caja_id, 'INGRESO', 
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_nuevo,
        p_credito_id, v_mensaje, p_metadata
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true, 
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$$;


ALTER FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb) OWNER TO postgres;

--
-- Name: registrar_pago_oficial(uuid, uuid, numeric, text, text, jsonb, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb DEFAULT '{}'::jsonb, p_usuario_id uuid DEFAULT auth.uid()) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_credito RECORD;
    v_nuevo_vencimiento DATE;
    v_interes_pagado DECIMAL := 0;
    v_capital_pagado DECIMAL := 0;
    v_mensaje TEXT;
    v_saldo_anterior DECIMAL;
    v_saldo_nuevo DECIMAL;
BEGIN
    -- 1. OBTENER DATOS DEL CRÉDITO
    SELECT * INTO v_credito FROM public.creditos WHERE id = p_credito_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito no encontrado';
    END IF;

    IF v_credito.estado = 'pagado' OR v_credito.estado = 'cancelado' THEN
        RAISE EXCEPTION 'Este crédito ya está cancelado.';
    END IF;

    -- Validar usuario_id
    IF p_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no identificado (p_usuario_id es NULL)';
    END IF;

    -- 2. CALCULAR MONTOS Y ACTUALIZAR CREDITOS
    IF p_tipo_operacion = 'RENOVACION' THEN
        -- Regla: Para renovar, debe cubrir al menos el interés acumulado
        v_interes_pagado := p_monto_pago;
        
        -- Extender vencimiento (usar el periodo original del crédito)
        v_nuevo_vencimiento := v_credito.fecha_vencimiento + (v_credito.periodo_dias || ' days')::INTERVAL;
        
        UPDATE public.creditos 
        SET fecha_vencimiento = v_nuevo_vencimiento,
            interes_acumulado = 0, -- Resetear interés acumulado
            estado = 'vigente' -- Si estaba vencido, revive
        WHERE id = p_credito_id;
        
        v_mensaje := 'Renovación exitosa. Nuevo vencimiento: ' || v_nuevo_vencimiento;

    ELSIF p_tipo_operacion = 'DESEMPENO' THEN
        -- Regla: Debe cubrir Todo (Capital + Interés)
        v_capital_pagado := v_credito.saldo_pendiente; 
        v_interes_pagado := p_monto_pago - v_capital_pagado;
        
        UPDATE public.creditos 
        SET saldo_pendiente = 0,
            interes_acumulado = 0,
            estado = 'cancelado',
            fecha_cancelacion = NOW()
        WHERE id = p_credito_id;
        
        -- Liberar garantía automáticamente
        UPDATE public.garantias 
        SET estado = 'devuelta',
            fecha_venta = NOW() 
        WHERE id = v_credito.garantia_id;
        
        v_mensaje := 'Crédito cancelado y prenda devuelta.';
    ELSE
        RAISE EXCEPTION 'Tipo de operación inválido';
    END IF;

    -- 3. REGISTRAR EL PAGO (Historial)
    -- FIX: Insertar explícitamente en 'metodo_pago' (Requerido por RxDB) y 'medio_pago' (Legacy)
    INSERT INTO public.pagos (
        credito_id, caja_operativa_id, monto_total, 
        desglose_capital, desglose_interes, 
        metodo_pago, medio_pago,
        metadata, usuario_id
    ) VALUES (
        p_credito_id, p_caja_id, p_monto_pago,
        v_capital_pagado, v_interes_pagado, 
        LOWER(p_metodo_pago), p_metodo_pago, -- 'metodo_pago' lowercase for RxDB match
        p_metadata, p_usuario_id
    );

    -- 4. OBTENER SALDO ACTUAL DE CAJA Y CALCULAR NUEVO
    SELECT saldo_actual INTO v_saldo_anterior 
    FROM public.cajas_operativas 
    WHERE id = p_caja_id;
    
    v_saldo_nuevo := v_saldo_anterior + p_monto_pago;

    -- 5. MOVER EL DINERO (Ledger de Caja)
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id, tipo, motivo, monto,
        saldo_anterior, saldo_nuevo,
        referencia_id, descripcion, metadata,
        usuario_id
    ) VALUES (
        p_caja_id, 'INGRESO', 
        CASE WHEN p_tipo_operacion = 'RENOVACION' THEN 'RENOVACION' ELSE 'DESEMPENO' END,
        p_monto_pago,
        v_saldo_anterior, v_saldo_nuevo,
        p_credito_id, v_mensaje, p_metadata,
        p_usuario_id
    );

    -- 6. ACTUALIZAR SALDO DE CAJA
    UPDATE public.cajas_operativas
    SET saldo_actual = v_saldo_nuevo
    WHERE id = p_caja_id;

    RETURN jsonb_build_object(
        'success', true, 
        'mensaje', v_mensaje,
        'nuevo_saldo_caja', v_saldo_nuevo
    );
END;
$$;


ALTER FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb, p_usuario_id uuid) OWNER TO postgres;

--
-- Name: reversar_movimiento(uuid, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid DEFAULT NULL::uuid) RETURNS TABLE(success boolean, mensaje text, movimiento_reversion_id uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_mov RECORD;
    v_tipo_inverso VARCHAR(50);
    v_nuevo_id UUID;
    v_caja RECORD;
BEGIN
    -- 1. Obtener movimiento original
    SELECT * INTO v_mov 
    FROM public.movimientos_caja_operativa 
    WHERE id = p_movimiento_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Movimiento no encontrado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 2. Verificar que no esté ya anulado
    IF v_mov.anulado THEN
        RETURN QUERY SELECT FALSE, 'Este movimiento ya fue anulado'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 3. Verificar que no sea una reversión
    IF v_mov.es_reversion THEN
        RETURN QUERY SELECT FALSE, 'No se puede reversar una reversión'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- 4. Determinar tipo inverso
    v_tipo_inverso := CASE v_mov.tipo 
        WHEN 'INGRESO' THEN 'EGRESO' 
        ELSE 'INGRESO' 
    END;
    
    -- 5. Obtener saldo actual de caja
    SELECT saldo_actual INTO v_caja 
    FROM public.cajas_operativas 
    WHERE id = v_mov.caja_operativa_id;
    
    -- 6. Crear movimiento de reversión
    INSERT INTO public.movimientos_caja_operativa (
        caja_operativa_id,
        caja_id,
        tipo,
        motivo,
        monto,
        saldo_anterior,
        saldo_nuevo,
        descripcion,
        usuario_id,
        es_reversion,
        movimiento_original_id,
        metadata
    ) VALUES (
        v_mov.caja_operativa_id,
        v_mov.caja_id,
        v_tipo_inverso,
        'REVERSION',
        v_mov.monto,
        v_caja.saldo_actual,
        CASE v_tipo_inverso 
            WHEN 'INGRESO' THEN v_caja.saldo_actual + v_mov.monto
            ELSE v_caja.saldo_actual - v_mov.monto
        END,
        'REVERSIÓN: ' || p_motivo || ' (Original: ' || v_mov.descripcion || ')',
        COALESCE(p_usuario_id, v_mov.usuario_id),
        TRUE,
        p_movimiento_id,
        jsonb_build_object(
            'movimiento_original', p_movimiento_id,
            'monto_original', v_mov.monto,
            'motivo_reversion', p_motivo
        )
    ) RETURNING id INTO v_nuevo_id;
    
    -- 7. Marcar movimiento original como anulado
    UPDATE public.movimientos_caja_operativa
    SET 
        anulado = TRUE,
        motivo_anulacion = p_motivo,
        anulado_por = p_usuario_id,
        anulado_at = NOW(),
        movimiento_reversion_id = v_nuevo_id
    WHERE id = p_movimiento_id;
    
    -- 8. Actualizar saldo de caja
    UPDATE public.cajas_operativas
    SET saldo_actual = CASE v_tipo_inverso 
        WHEN 'INGRESO' THEN saldo_actual + v_mov.monto
        ELSE saldo_actual - v_mov.monto
    END
    WHERE id = v_mov.caja_operativa_id;
    
    RETURN QUERY SELECT TRUE, 
        ('Movimiento reversado. Nuevo saldo ajustado.')::TEXT, 
        v_nuevo_id;
END;
$$;


ALTER FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid) OWNER TO postgres;

--
-- Name: FUNCTION reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid) IS 'Crea movimiento inverso y marca original como anulado. NO borra nada. Auditoría completa.';


--
-- Name: security_prevent_self_credit(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.security_prevent_self_credit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_employee_persona_id UUID;
    v_client_persona_id UUID;
BEGIN
    -- Solo aplica si el usuario está autenticado
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- A. Obtener Persona del Usuario actual (Empleado que opera)
    SELECT persona_id INTO v_employee_persona_id
    FROM public.empleados
    WHERE user_id = auth.uid();

    -- Si no es empleado (ej. admin puro sin rol de empleado o service_role), permitimos (auditoría lo capturará)
    IF v_employee_persona_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- B. Obtener Persona del Cliente que solicita el crédito
    SELECT persona_id INTO v_client_persona_id
    FROM public.clientes
    WHERE id = NEW.cliente_id;

    -- C. COMPARAR: Si son la misma persona física -> BLOQUEAR
    IF v_employee_persona_id = v_client_persona_id THEN
        RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD (SoD): Conflicto de Interés. No puedes procesar un crédito para ti mismo. Solicita a otro cajero.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.security_prevent_self_credit() OWNER TO postgres;

--
-- Name: FUNCTION security_prevent_self_credit(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.security_prevent_self_credit() IS 'SoD: Impide que un empleado cree créditos para sí mismo.';


--
-- Name: security_prevent_self_payment(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.security_prevent_self_payment() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_cajero_persona_id UUID;
    v_cliente_persona_id UUID;
BEGIN
    -- A. Obtener Persona del Cajero dueño de la Caja Operativa
    -- Nota: Usamos la caja_operativa_id del pago para saber quién está cobrando, 
    -- independiente de quién esté logueado (aunque debería coincidir por RLS).
    SELECT e.persona_id INTO v_cajero_persona_id
    FROM public.cajas_operativas c
    JOIN public.usuarios u ON c.usuario_id = u.id -- Link legacy
    JOIN public.empleados e ON e.user_id = u.id   -- Link enterprise
    WHERE c.id = NEW.caja_operativa_id;

    IF v_cajero_persona_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- B. Obtener Persona del Cliente dueño del Crédito
    SELECT cl.persona_id INTO v_cliente_persona_id
    FROM public.creditos cr
    JOIN public.clientes cl ON cr.cliente_id = cl.id
    WHERE cr.id = NEW.credito_id;

    -- C. COMPARAR
    IF v_cajero_persona_id = v_cliente_persona_id THEN
         RAISE EXCEPTION 'VIOLACIÓN DE SEGURIDAD (SoD): Conflicto de Interés. No puedes registrar cobros de tus propios créditos en tu caja.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.security_prevent_self_payment() OWNER TO postgres;

--
-- Name: FUNCTION security_prevent_self_payment(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.security_prevent_self_payment() IS 'SoD: Impide que un cajero cobre sus propios pagos en su caja.';


--
-- Name: sync_caja_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_caja_ids() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.caja_id IS NULL AND NEW.caja_operativa_id IS NOT NULL THEN
        NEW.caja_id := NEW.caja_operativa_id;
    ELSIF NEW.caja_operativa_id IS NULL AND NEW.caja_id IS NOT NULL THEN
        NEW.caja_operativa_id := NEW.caja_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.sync_caja_ids() OWNER TO postgres;

--
-- Name: update_personas_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_personas_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_personas_updated_at() OWNER TO postgres;

--
-- Name: update_saldo_credito_on_pago(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_saldo_credito_on_pago() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Handle RENEWALS (Renovacion)
    IF NEW.tipo = 'renovacion' THEN
        -- For renewals, we DO NOT subtract from the principal (saldo_pendiente).
        -- The payment covers interest.
        -- We ensure the status is 'vigente'.
        -- Note: The date extension and interest reset are handled by the Client (RxDB) 
        -- and will sync separately. We just ensure we don't mess up the balance here.
        UPDATE public.creditos
        SET 
            estado = 'vigente',
            updated_at = NOW()
        WHERE id = NEW.credito_id;

    ELSE
        -- Standard Logic (Amortizacion, Liquidacion, Interes normal? maybe)
        -- For standard payments, we subtract from balance.
        UPDATE public.creditos
        SET 
            saldo_pendiente = saldo_pendiente - NEW.monto,
            -- Auto-close if balance is near zero
            estado = CASE 
                WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
                ELSE estado 
            END,
            estado_detallado = CASE 
                WHEN (saldo_pendiente - NEW.monto) <= 0.5 THEN 'cancelado' 
                ELSE estado_detallado 
            END,
            updated_at = NOW()
        WHERE id = NEW.credito_id;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_saldo_credito_on_pago() OWNER TO postgres;

--
-- Name: validate_credito_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_credito_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado', 'pagado'];
BEGIN
    -- REGLA 1: Si el crédito actual tiene estado terminal, no permitir cambios de estado
    IF OLD.estado = ANY(estados_terminales) THEN
        -- Solo permitir actualización de campos no críticos
        IF NEW.estado != OLD.estado THEN
            RAISE EXCEPTION 'No se puede cambiar el estado de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
        
        -- No permitir cambio de montos en estados terminales
        IF NEW.monto_prestado != OLD.monto_prestado OR 
           NEW.saldo_pendiente != OLD.saldo_pendiente THEN
            RAISE EXCEPTION 'No se pueden modificar montos de un crédito %', OLD.estado
                USING HINT = 'El crédito ya está en estado terminal';
        END IF;
    END IF;
    
    -- REGLA 2: ANULADO siempre gana - si se intenta anular, permitirlo
    IF NEW.estado = 'anulado' THEN
        -- Anulación siempre permitida (es el estado de mayor prioridad)
        RETURN NEW;
    END IF;
    
    -- REGLA 3: No permitir "retroceder" de estados terminales a no terminales
    IF OLD.estado = ANY(estados_terminales) AND NOT (NEW.estado = ANY(estados_terminales)) THEN
        RAISE EXCEPTION 'No se puede revertir un crédito desde % a %', OLD.estado, NEW.estado
            USING HINT = 'Los estados terminales no pueden revertirse';
    END IF;
    
    -- Actualizar timestamp de modificación
    NEW._modified = NOW();
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_credito_update() OWNER TO postgres;

--
-- Name: FUNCTION validate_credito_update(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.validate_credito_update() IS 'Implementa Opción 2C de resolución de conflictos:
- Estados terminales (cancelado, vendido, remate, anulado, pagado) no pueden cambiar
- Montos no pueden modificarse en estados terminales
- ANULADO tiene máxima prioridad y siempre puede aplicarse
- Previene sincronización conflictiva desde dispositivos offline';


--
-- Name: validate_pago_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_pago_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    credito_estado TEXT;
    estados_terminales TEXT[] := ARRAY['cancelado', 'vendido', 'remate', 'anulado'];
BEGIN
    -- Obtener el estado actual del crédito
    SELECT estado INTO credito_estado
    FROM public.creditos
    WHERE id = NEW.credito_id;
    
    -- No permitir pagos en créditos con estados terminales (excepto pagado)
    IF credito_estado = ANY(estados_terminales) THEN
        RAISE EXCEPTION 'No se pueden registrar pagos en un crédito %', credito_estado
            USING HINT = 'El crédito está en estado terminal';
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_pago_insert() OWNER TO postgres;

--
-- Name: FUNCTION validate_pago_insert(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.validate_pago_insert() IS 'Previene registro de pagos en créditos terminales para mantener integridad financiera';


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret character varying(255),
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 1000,
    max_payload_size_in_kb integer DEFAULT 3000,
    CONSTRAINT jwt_secret_or_jwt_jwks_required CHECK (((jwt_secret IS NOT NULL) OR (jwt_jwks IS NOT NULL)))
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tabla text NOT NULL,
    registro_id uuid NOT NULL,
    accion text NOT NULL,
    usuario_id uuid,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: TABLE audit_log; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.audit_log IS 'Registro de auditoría para cambios críticos del sistema';


--
-- Name: auditoria_transacciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_transacciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tabla_afectada character varying(50) NOT NULL,
    registro_id uuid NOT NULL,
    accion character varying(20) NOT NULL,
    usuario_id uuid,
    empleado_id uuid,
    datos_antes jsonb,
    datos_despues jsonb,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auditoria_accion_check CHECK (((accion)::text = ANY (ARRAY[('INSERT'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text])))
);


ALTER TABLE public.auditoria_transacciones OWNER TO postgres;

--
-- Name: TABLE auditoria_transacciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.auditoria_transacciones IS 'Registro completo de todas las transacciones críticas del sistema';


--
-- Name: cajas_operativas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cajas_operativas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    boveda_origen_id uuid,
    numero_caja integer NOT NULL,
    estado character varying(20) DEFAULT 'cerrada'::character varying NOT NULL,
    saldo_inicial numeric(15,2) DEFAULT 0,
    saldo_actual numeric(15,2) DEFAULT 0,
    saldo_final_cierre numeric(15,2),
    diferencia_cierre numeric(15,2),
    fecha_apertura timestamp with time zone DEFAULT now(),
    fecha_cierre timestamp with time zone,
    observaciones_cierre text,
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL,
    cuenta_origen_id uuid,
    CONSTRAINT chk_caja_saldo_positivo CHECK ((saldo_actual >= (0)::numeric))
);


ALTER TABLE public.cajas_operativas OWNER TO postgres;

--
-- Name: TABLE cajas_operativas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cajas_operativas IS 'Sesiones de trabajo de cajeros. Ciclo: abierta -> operando -> cerrada.';


--
-- Name: COLUMN cajas_operativas.observaciones_cierre; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.cajas_operativas.observaciones_cierre IS 'Notas del cajero al cerrar turno (diferencias, incidencias, etc.)';


--
-- Name: categorias_garantia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias_garantia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    porcentaje_prestamo_maximo numeric(5,2) DEFAULT 60.00
);


ALTER TABLE public.categorias_garantia OWNER TO postgres;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    tipo_documento character varying(20) NOT NULL,
    numero_documento character varying(20) NOT NULL,
    nombres character varying(100),
    apellido_paterno character varying(100),
    apellido_materno character varying(100),
    email character varying(100),
    telefono_principal character varying(20),
    direccion text,
    score_crediticio integer DEFAULT 500,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    persona_id uuid,
    ubigeo_cod character varying(6),
    departamento character varying(50),
    provincia character varying(50),
    distrito character varying(50),
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: COLUMN clientes.ubigeo_cod; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.clientes.ubigeo_cod IS 'Código de 6 dígitos del distrito (INEI)';


--
-- Name: personas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo_documento character varying(10) DEFAULT 'DNI'::character varying NOT NULL,
    numero_documento character varying(20) NOT NULL,
    nombres character varying(200) NOT NULL,
    apellido_paterno character varying(100) NOT NULL,
    apellido_materno character varying(100) NOT NULL,
    email character varying(100),
    telefono_principal character varying(20),
    telefono_secundario character varying(20),
    direccion text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.personas OWNER TO postgres;

--
-- Name: TABLE personas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.personas IS 'Tabla maestra de personas físicas o jurídicas. Centraliza datos de identificación.';


--
-- Name: clientes_completo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.clientes_completo AS
 SELECT c.id,
    c.persona_id,
    c.empresa_id,
    c.score_crediticio,
    c.activo,
    c.created_at,
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    (((((p.nombres)::text || ' '::text) || (p.apellido_paterno)::text) || ' '::text) || (p.apellido_materno)::text) AS nombre_completo,
    p.email,
    p.telefono_principal,
    p.telefono_secundario,
    p.direccion
   FROM (public.clientes c
     JOIN public.personas p ON ((c.persona_id = p.id)));


ALTER VIEW public.clientes_completo OWNER TO postgres;

--
-- Name: VIEW clientes_completo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.clientes_completo IS 'Vista desnormalizada de clientes con datos de persona. Usar en consultas.';


--
-- Name: contratos_fondeo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contratos_fondeo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inversionista_id uuid NOT NULL,
    tipo public.tipo_contrato_fondeo NOT NULL,
    monto_pactado numeric(15,2) NOT NULL,
    tasa_retorno numeric(8,4) NOT NULL,
    fecha_inicio date DEFAULT CURRENT_DATE NOT NULL,
    fecha_vencimiento date,
    frecuencia_pago public.frecuencia_pago_fondeo DEFAULT 'MENSUAL'::public.frecuencia_pago_fondeo,
    estado public.estado_contrato_fondeo DEFAULT 'ACTIVO'::public.estado_contrato_fondeo,
    monto_capital_devuelto numeric(15,2) DEFAULT 0,
    monto_rendimientos_pagados numeric(15,2) DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT contratos_fondeo_monto_capital_devuelto_check CHECK ((monto_capital_devuelto >= (0)::numeric)),
    CONSTRAINT contratos_fondeo_monto_pactado_check CHECK ((monto_pactado > (0)::numeric)),
    CONSTRAINT contratos_fondeo_monto_rendimientos_pagados_check CHECK ((monto_rendimientos_pagados >= (0)::numeric)),
    CONSTRAINT contratos_fondeo_tasa_retorno_check CHECK ((tasa_retorno >= (0)::numeric))
);


ALTER TABLE public.contratos_fondeo OWNER TO postgres;

--
-- Name: TABLE contratos_fondeo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.contratos_fondeo IS 'Contratos de inversión que definen los términos de rendimiento para cada inversionista. 
DEUDA_FIJA: Genera interés mensual fijo calculado automáticamente.
PARTICIPACION_EQUITY: Participa en utilidades, se calcula manualmente al cierre.';


--
-- Name: creditos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creditos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    codigo character varying(50),
    cliente_id uuid NOT NULL,
    caja_origen_id uuid,
    empresa_id uuid,
    monto_prestado numeric(12,2) NOT NULL,
    tasa_interes numeric(5,2) NOT NULL,
    periodo_dias integer NOT NULL,
    fecha_desembolso timestamp without time zone DEFAULT now(),
    fecha_vencimiento date NOT NULL,
    saldo_pendiente numeric(12,2) NOT NULL,
    interes_acumulado numeric(12,2) DEFAULT 0,
    estado character varying(50) DEFAULT 'vigente'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    estado_detallado character varying(30) NOT NULL,
    dias_transcurridos integer,
    interes_devengado_actual numeric(12,2) DEFAULT 0,
    codigo_credito character varying(50),
    fecha_inicio date,
    observaciones text,
    created_by uuid,
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL,
    fecha_cancelacion timestamp with time zone,
    CONSTRAINT chk_estado_valido CHECK (((estado)::text = ANY (ARRAY[('vigente'::character varying)::text, ('vencido'::character varying)::text, ('en_mora'::character varying)::text, ('pre_remate'::character varying)::text, ('en_remate'::character varying)::text, ('cancelado'::character varying)::text, ('renovado'::character varying)::text, ('anulado'::character varying)::text, ('aprobado'::character varying)::text]))),
    CONSTRAINT creditos_estado_detallado_check CHECK (((estado_detallado)::text = ANY (ARRAY[('vigente'::character varying)::text, ('al_dia'::character varying)::text, ('por_vencer'::character varying)::text, ('vencido'::character varying)::text, ('en_mora'::character varying)::text, ('en_gracia'::character varying)::text, ('pre_remate'::character varying)::text, ('en_remate'::character varying)::text, ('cancelado'::character varying)::text, ('renovado'::character varying)::text, ('ejecutado'::character varying)::text, ('anulado'::character varying)::text])))
);


ALTER TABLE public.creditos OWNER TO postgres;

--
-- Name: COLUMN creditos.estado_detallado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos.estado_detallado IS 'Estado detallado del ciclo de vida del crédito. Se actualiza automáticamente según fechas y pagos.';


--
-- Name: COLUMN creditos.dias_transcurridos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos.dias_transcurridos IS 'Días transcurridos desde el desembolso hasta hoy (actualizado automáticamente por trigger)';


--
-- Name: COLUMN creditos.interes_devengado_actual; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos.interes_devengado_actual IS 'Interés devengado hasta la fecha actual (actualizado automáticamente por trigger). Fórmula: Capital × (Tasa/100) × (Días/30)';


--
-- Name: COLUMN creditos.codigo_credito; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos.codigo_credito IS 'Alias de codigo para compatibilidad con código';


--
-- Name: COLUMN creditos.observaciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos.observaciones IS 'Notas administrativas del crédito';


--
-- Name: COLUMN creditos._deleted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos._deleted IS 'Soft delete para sincronización RxDB (no eliminar físicamente)';


--
-- Name: COLUMN creditos._modified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.creditos._modified IS 'Timestamp de última modificación para sincronización RxDB';


--
-- Name: cuentas_financieras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_financieras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo public.tipo_cuenta_financiera NOT NULL,
    saldo numeric(15,2) DEFAULT 0.00 NOT NULL,
    moneda character varying(3) DEFAULT 'PEN'::character varying NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    banco_asociado public.banco_peru,
    numero_cuenta character varying(50),
    titular_cuenta character varying(100),
    es_principal boolean DEFAULT false,
    CONSTRAINT chk_saldo_security CHECK ((saldo >= (0)::numeric))
);


ALTER TABLE public.cuentas_financieras OWNER TO postgres;

--
-- Name: TABLE cuentas_financieras; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.cuentas_financieras IS 'Cuentas reales donde reside el dinero (Físico o Banco).';


--
-- Name: COLUMN cuentas_financieras.banco_asociado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.cuentas_financieras.banco_asociado IS 'Entidad financiera real (Ej: BCP).';


--
-- Name: COLUMN cuentas_financieras.es_principal; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.cuentas_financieras.es_principal IS 'Indica la cuenta de EFECTIVO por defecto para operaciones automáticas.';


--
-- Name: departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamentos (
    codigo character varying(2) NOT NULL,
    nombre character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.departamentos OWNER TO postgres;

--
-- Name: distritos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.distritos (
    ubigeo_inei character varying(6) NOT NULL,
    nombre character varying(100) NOT NULL,
    provincia_codigo character varying(4) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.distritos OWNER TO postgres;

--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    persona_id uuid NOT NULL,
    user_id uuid,
    cargo character varying(50) NOT NULL,
    sucursal_id uuid,
    activo boolean DEFAULT true,
    fecha_ingreso date DEFAULT CURRENT_DATE,
    fecha_salida date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: TABLE empleados; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.empleados IS 'Empleados de la empresa. Referencia a personas y auth.users.';


--
-- Name: empleados_completo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.empleados_completo AS
 SELECT e.id,
    e.persona_id,
    e.user_id,
    e.cargo,
    e.sucursal_id,
    e.activo,
    e.fecha_ingreso,
    e.fecha_salida,
    e.created_at,
    p.tipo_documento,
    p.numero_documento,
    p.nombres,
    p.apellido_paterno,
    p.apellido_materno,
    (((((p.nombres)::text || ' '::text) || (p.apellido_paterno)::text) || ' '::text) || (p.apellido_materno)::text) AS nombre_completo,
    p.email,
    p.telefono_principal,
    p.direccion
   FROM (public.empleados e
     JOIN public.personas p ON ((e.persona_id = p.id)));


ALTER VIEW public.empleados_completo OWNER TO postgres;

--
-- Name: VIEW empleados_completo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.empleados_completo IS 'Vista desnormalizada de empleados con datos de persona.';


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ruc character varying(11) NOT NULL,
    razon_social character varying(255) NOT NULL,
    nombre_comercial character varying(255),
    direccion text,
    telefono character varying(20),
    email character varying(100),
    logo_url text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.empresas OWNER TO postgres;

--
-- Name: eventos_sistema; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eventos_sistema (
    id bigint NOT NULL,
    agregado_tipo character varying(50) NOT NULL,
    agregado_id uuid NOT NULL,
    evento_tipo character varying(100) NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    usuario_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.eventos_sistema OWNER TO postgres;

--
-- Name: eventos_sistema_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eventos_sistema_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eventos_sistema_id_seq OWNER TO postgres;

--
-- Name: eventos_sistema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eventos_sistema_id_seq OWNED BY public.eventos_sistema.id;


--
-- Name: garantias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garantias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid,
    categoria_id uuid,
    descripcion text NOT NULL,
    valor_tasacion numeric(12,2) NOT NULL,
    valor_prestamo_sugerido numeric(12,2),
    estado character varying(50) DEFAULT 'custodia'::character varying,
    fotos_urls text[],
    created_at timestamp without time zone DEFAULT now(),
    marca character varying(100),
    modelo character varying(100),
    serie character varying(100),
    subcategoria character varying(100),
    estado_bien character varying(50),
    anio integer,
    placa character varying(20),
    kilometraje numeric(10,2),
    area numeric(10,2),
    ubicacion text,
    partida_registral character varying(50),
    peso numeric(10,2),
    quilataje character varying(20),
    capacidad character varying(100),
    fecha_venta timestamp with time zone,
    precio_venta numeric(12,2),
    credito_id uuid,
    fotos text[],
    updated_at timestamp with time zone DEFAULT now(),
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT garantias_estado_check CHECK (((estado)::text = ANY (ARRAY[('custodia_caja'::character varying)::text, ('en_transito'::character varying)::text, ('custodia_boveda'::character varying)::text, ('en_remate'::character varying)::text, ('vendida'::character varying)::text, ('devuelta'::character varying)::text, ('custodia'::character varying)::text, ('remate'::character varying)::text])))
);


ALTER TABLE public.garantias OWNER TO postgres;

--
-- Name: COLUMN garantias.subcategoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.garantias.subcategoria IS 'Subcategoría específica del bien (ej: Laptop Gamer, Sedan, Anillo)';


--
-- Name: COLUMN garantias.estado_bien; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.garantias.estado_bien IS 'Estado físico: NUEVO, EXCELENTE, BUENO, REGULAR, MALO';


--
-- Name: COLUMN garantias.fecha_venta; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.garantias.fecha_venta IS 'Fecha en que se vendió la prenda en remate';


--
-- Name: COLUMN garantias.precio_venta; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.garantias.precio_venta IS 'Precio de venta en remate';


--
-- Name: inversionistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inversionistas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    persona_id uuid NOT NULL,
    tipo_relacion public.tipo_inversionista NOT NULL,
    participacion_porcentaje numeric(5,2) DEFAULT 0,
    fecha_ingreso date DEFAULT CURRENT_DATE,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.inversionistas OWNER TO postgres;

--
-- Name: TABLE inversionistas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.inversionistas IS 'Personas que inyectan capital al negocio.';


--
-- Name: movimientos_caja_operativa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_caja_operativa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    caja_operativa_id uuid NOT NULL,
    tipo character varying(50) NOT NULL,
    motivo character varying(50) NOT NULL,
    monto numeric(15,2) NOT NULL,
    saldo_anterior numeric(15,2) NOT NULL,
    saldo_nuevo numeric(15,2) NOT NULL,
    referencia_id uuid,
    descripcion text,
    metadata jsonb DEFAULT '{}'::jsonb,
    usuario_id uuid NOT NULL,
    fecha timestamp with time zone DEFAULT now(),
    caja_id uuid,
    anulado boolean DEFAULT false,
    motivo_anulacion text,
    anulado_por uuid,
    anulado_at timestamp with time zone,
    movimiento_reversion_id uuid,
    es_reversion boolean DEFAULT false,
    movimiento_original_id uuid,
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_monto_positivo CHECK ((monto > (0)::numeric))
);


ALTER TABLE public.movimientos_caja_operativa OWNER TO postgres;

--
-- Name: TABLE movimientos_caja_operativa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.movimientos_caja_operativa IS 'APPEND-ONLY: Ledger inmutable. Cada centavo que circule. Nunca DELETE/UPDATE.';


--
-- Name: COLUMN movimientos_caja_operativa.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimientos_caja_operativa.metadata IS 'JSONB: Evidencia de medios de pago (YAPE, PLIN, etc). { medio_pago, numero_transaccion, ... }';


--
-- Name: COLUMN movimientos_caja_operativa._deleted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimientos_caja_operativa._deleted IS 'Soft delete para sincronización RxDB';


--
-- Name: COLUMN movimientos_caja_operativa._modified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.movimientos_caja_operativa._modified IS 'Timestamp de última modificación para sincronización RxDB';


--
-- Name: movimientos_efectivos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.movimientos_efectivos AS
 SELECT id,
    caja_operativa_id,
    tipo,
    motivo,
    monto,
    saldo_anterior,
    saldo_nuevo,
    referencia_id,
    descripcion,
    metadata,
    usuario_id,
    fecha,
    caja_id,
    anulado,
    motivo_anulacion,
    anulado_por,
    anulado_at,
    movimiento_reversion_id,
    es_reversion,
    movimiento_original_id,
        CASE
            WHEN anulado THEN (0)::numeric
            ELSE
            CASE tipo
                WHEN 'INGRESO'::text THEN monto
                ELSE (- monto)
            END
        END AS efecto_neto
   FROM public.movimientos_caja_operativa m
  ORDER BY fecha DESC;


ALTER VIEW public.movimientos_efectivos OWNER TO postgres;

--
-- Name: VIEW movimientos_efectivos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.movimientos_efectivos IS 'Movimientos excluyendo anulados. Usar para cálculos de saldo.';


--
-- Name: notificaciones_enviadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones_enviadas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    credito_id uuid NOT NULL,
    cliente_id uuid NOT NULL,
    tipo_notificacion character varying(50) NOT NULL,
    mensaje_enviado text NOT NULL,
    telefono_destino character varying(20) NOT NULL,
    enviado_por uuid,
    fecha_envio timestamp with time zone DEFAULT now(),
    estado character varying(20) DEFAULT 'enviado'::character varying,
    medio character varying(20) DEFAULT 'whatsapp'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notificaciones_enviadas OWNER TO postgres;

--
-- Name: TABLE notificaciones_enviadas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notificaciones_enviadas IS 'Registro de todas las notificaciones enviadas a clientes';


--
-- Name: notificaciones_pendientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones_pendientes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cliente_id uuid,
    credito_id uuid,
    tipo text NOT NULL,
    titulo text NOT NULL,
    mensaje text NOT NULL,
    monto numeric(12,2),
    telefono text,
    email text,
    estado text DEFAULT 'pendiente'::text,
    fecha_envio timestamp with time zone,
    fecha_procesado timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notificaciones_pendientes OWNER TO postgres;

--
-- Name: TABLE notificaciones_pendientes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notificaciones_pendientes IS 'Notificaciones pendientes como excedentes de remate o vencimientos';


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    credito_id uuid,
    caja_operativa_id uuid,
    monto_total numeric(12,2) NOT NULL,
    desglose_capital numeric(12,2),
    desglose_interes numeric(12,2),
    desglose_mora numeric(12,2),
    medio_pago character varying(50),
    metadata jsonb,
    fecha_pago timestamp without time zone DEFAULT now(),
    tipo character varying(50) DEFAULT 'PAGO'::character varying,
    metodo_pago character varying(50),
    observaciones text,
    usuario_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    anulado boolean DEFAULT false,
    motivo_anulacion text,
    anulado_por uuid,
    anulado_at timestamp with time zone,
    _deleted boolean DEFAULT false NOT NULL,
    _modified timestamp with time zone DEFAULT now() NOT NULL,
    monto numeric(12,2)
);


ALTER TABLE public.pagos OWNER TO postgres;

--
-- Name: COLUMN pagos.tipo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.tipo IS 'Tipo de pago: interes, capital, desempeno, mora, renovacion';


--
-- Name: COLUMN pagos.metodo_pago; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.metodo_pago IS 'Método: efectivo, yape, plin, transferencia';


--
-- Name: COLUMN pagos.usuario_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.usuario_id IS 'Cajero que registró el pago';


--
-- Name: COLUMN pagos._deleted; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos._deleted IS 'Soft delete para sincronización RxDB';


--
-- Name: COLUMN pagos._modified; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos._modified IS 'Timestamp de última modificación para sincronización RxDB';


--
-- Name: COLUMN pagos.monto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pagos.monto IS 'Monto del pago (compatible con RxDB)';


--
-- Name: pagos_efectivos; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.pagos_efectivos AS
 SELECT id,
    credito_id,
    caja_operativa_id,
    monto_total,
    desglose_capital,
    desglose_interes,
    desglose_mora,
    medio_pago,
    metadata,
    fecha_pago,
    tipo,
    metodo_pago,
    observaciones,
    usuario_id,
    created_at,
    anulado,
    motivo_anulacion,
    anulado_por,
    anulado_at
   FROM public.pagos
  WHERE ((anulado = false) OR (anulado IS NULL));


ALTER VIEW public.pagos_efectivos OWNER TO postgres;

--
-- Name: provincias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provincias (
    codigo character varying(4) NOT NULL,
    nombre character varying(100) NOT NULL,
    departamento_codigo character varying(2) NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.provincias OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    nivel_acceso integer DEFAULT 1,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: sugerencias_catalogos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sugerencias_catalogos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo character varying(50) NOT NULL,
    categoria_padre character varying(100),
    valor_sugerido character varying(255) NOT NULL,
    usuario_id uuid,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sugerencias_catalogos OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    yape_limite_diario numeric(15,2) DEFAULT 500.00,
    yape_exigir_evidencia boolean DEFAULT true,
    yape_destino_personal_permitido boolean DEFAULT false,
    tesoreria_separar_cuentas_socios boolean DEFAULT true,
    tesoreria_retiro_desde_caja boolean DEFAULT false,
    credito_renovacion_genera_nuevo_contrato boolean DEFAULT false,
    credito_calculo_interes_anticipado text DEFAULT 'PERIODO_COMPLETO'::text,
    credito_liberacion_garantia_parcial boolean DEFAULT false,
    credito_interes_moratorio_diario numeric(5,3) DEFAULT 0.5,
    remate_precio_base_automatico boolean DEFAULT true,
    remate_devolver_excedente boolean DEFAULT true,
    caja_permiso_anular_recibo boolean DEFAULT false,
    caja_cierre_ciego boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid,
    precio_oro_24k_pen numeric(10,2) DEFAULT 220.00,
    precio_oro_22k_pen numeric(10,2) DEFAULT 200.00,
    precio_oro_21k_pen numeric(10,2) DEFAULT 190.00,
    precio_oro_18k_pen numeric(10,2) DEFAULT 165.00,
    precio_oro_14k_pen numeric(10,2) DEFAULT 128.00,
    precio_oro_10k_pen numeric(10,2) DEFAULT 92.00,
    precio_oro_updated_at timestamp with time zone DEFAULT now(),
    precio_oro_source character varying(50) DEFAULT 'manual'::character varying
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: TABLE system_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_settings IS 'SINGLETON: Motor de Reglas. Admin ajusta comportamiento sin reprogramar.';


--
-- Name: COLUMN system_settings.caja_cierre_ciego; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.caja_cierre_ciego IS 'TRUE = Cajero cierra sin ver saldo (estándar bancario). FALSE = Ver saldo.';


--
-- Name: COLUMN system_settings.precio_oro_24k_pen; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.precio_oro_24k_pen IS 'Precio del oro 24K por gramo en PEN (fuente: GoldAPI.io)';


--
-- Name: COLUMN system_settings.precio_oro_updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.precio_oro_updated_at IS 'Última actualización del precio del oro';


--
-- Name: COLUMN system_settings.precio_oro_source; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.precio_oro_source IS 'Fuente del precio: manual o goldapi';


--
-- Name: transacciones_capital; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transacciones_capital (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inversionista_id uuid,
    origen_cuenta_id uuid,
    destino_cuenta_id uuid,
    tipo public.tipo_transaccion_capital NOT NULL,
    monto numeric(15,2) NOT NULL,
    descripcion text,
    evidencia_ref text,
    fecha_operacion timestamp with time zone DEFAULT now(),
    created_by uuid,
    metodo_pago public.metodo_pago_peru DEFAULT 'EFECTIVO'::public.metodo_pago_peru NOT NULL,
    numero_operacion character varying(50),
    banco_origen public.banco_peru,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT transacciones_capital_monto_check CHECK ((monto > (0)::numeric))
);


ALTER TABLE public.transacciones_capital OWNER TO postgres;

--
-- Name: COLUMN transacciones_capital.numero_operacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transacciones_capital.numero_operacion IS 'Código de operación del voucher bancario. Debe ser único por cuenta destino.';


--
-- Name: COLUMN transacciones_capital.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.transacciones_capital.metadata IS 'Datos adicionales estructurados (ej: IDs de referencia, snapshots)';


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid,
    email character varying(100) NOT NULL,
    nombres character varying(100) NOT NULL,
    apellido_paterno character varying(100),
    apellido_materno character varying(100),
    dni character varying(8),
    rol_id uuid,
    rol character varying(50),
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: verificacion_whatsapp; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verificacion_whatsapp (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    telefono character varying(9) NOT NULL,
    codigo character varying(6) NOT NULL,
    creado_en timestamp with time zone DEFAULT now(),
    expira_en timestamp with time zone NOT NULL,
    verificado boolean DEFAULT false,
    creado_por uuid
);


ALTER TABLE public.verificacion_whatsapp OWNER TO postgres;

--
-- Name: TABLE verificacion_whatsapp; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.verificacion_whatsapp IS 'Almacena códigos OTP para validación de teléfonos vía WhatsApp.';


--
-- Name: COLUMN verificacion_whatsapp.telefono; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificacion_whatsapp.telefono IS 'Número de teléfono (9 dígitos) sin prefijo de país.';


--
-- Name: COLUMN verificacion_whatsapp.codigo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificacion_whatsapp.codigo IS 'Código numérico de 6 dígitos generado aleatoriamente.';


--
-- Name: COLUMN verificacion_whatsapp.expira_en; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificacion_whatsapp.expira_en IS 'Timestamp de expiración (usualmente 5 min desde creación).';


--
-- Name: COLUMN verificacion_whatsapp.verificado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.verificacion_whatsapp.verificado IS 'Flag que indica si el código ya fue canjeado exitosamente.';


--
-- Name: vista_creditos_intereses; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_creditos_intereses AS
 SELECT c.id,
    c.codigo,
    c.monto_prestado,
    c.tasa_interes,
    c.dias_transcurridos,
    c.interes_devengado_actual,
    c.fecha_desembolso,
    c.fecha_vencimiento,
    c.saldo_pendiente,
    c.estado_detallado,
    round(((c.monto_prestado * (c.tasa_interes / 100.0)) * ((c.periodo_dias)::numeric / 30.0)), 2) AS interes_total_vencimiento,
        CASE
            WHEN (c.periodo_dias > 0) THEN round((((COALESCE(c.dias_transcurridos, 0))::numeric / (c.periodo_dias)::numeric) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS porcentaje_devengado,
    cl.nombres AS cliente_nombre,
    cl.numero_documento AS cliente_dni
   FROM (public.creditos c
     LEFT JOIN public.clientes cl ON ((c.cliente_id = cl.id)))
  WHERE ((c.estado_detallado)::text <> ALL (ARRAY[('cancelado'::character varying)::text, ('ejecutado'::character varying)::text, ('anulado'::character varying)::text]));


ALTER VIEW public.vista_creditos_intereses OWNER TO postgres;

--
-- Name: VIEW vista_creditos_intereses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_creditos_intereses IS 'Vista completa de créditos con información de intereses calculados';


--
-- Name: vista_rendimientos_inversionistas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_rendimientos_inversionistas AS
 SELECT cf.id AS contrato_id,
    cf.inversionista_id,
    i.tipo_relacion,
    (((p.nombres)::text || ' '::text) || (p.apellido_paterno)::text) AS nombre_inversionista,
    cf.tipo AS tipo_contrato,
    cf.monto_pactado,
    cf.tasa_retorno,
    cf.fecha_inicio,
    cf.fecha_vencimiento,
    cf.estado,
    (CURRENT_DATE - cf.fecha_inicio) AS dias_transcurridos,
        CASE
            WHEN (cf.tipo = 'DEUDA_FIJA'::public.tipo_contrato_fondeo) THEN round(((cf.monto_pactado * (cf.tasa_retorno / 100.0)) * (((CURRENT_DATE - cf.fecha_inicio))::numeric / 30.0)), 2)
            ELSE (0)::numeric
        END AS rendimiento_devengado,
    cf.monto_rendimientos_pagados,
        CASE
            WHEN (cf.tipo = 'DEUDA_FIJA'::public.tipo_contrato_fondeo) THEN (round(((cf.monto_pactado * (cf.tasa_retorno / 100.0)) * (((CURRENT_DATE - cf.fecha_inicio))::numeric / 30.0)), 2) - cf.monto_rendimientos_pagados)
            ELSE (0)::numeric
        END AS rendimiento_pendiente_pago,
    (cf.monto_pactado - cf.monto_capital_devuelto) AS capital_pendiente
   FROM ((public.contratos_fondeo cf
     JOIN public.inversionistas i ON ((cf.inversionista_id = i.id)))
     JOIN public.personas p ON ((i.persona_id = p.id)))
  WHERE (cf.estado = 'ACTIVO'::public.estado_contrato_fondeo);


ALTER VIEW public.vista_rendimientos_inversionistas OWNER TO postgres;

--
-- Name: VIEW vista_rendimientos_inversionistas; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.vista_rendimientos_inversionistas IS 'Vista calculada que muestra los rendimientos devengados de cada contrato activo.
Para DEUDA_FIJA: Calcula interés simple proporcional a días transcurridos.
Para EQUITY: Muestra 0 (se calcula manualmente).';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_12_16; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_12_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_12_16 OWNER TO supabase_admin;

--
-- Name: messages_2025_12_17; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_12_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_12_17 OWNER TO supabase_admin;

--
-- Name: messages_2025_12_18; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_12_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_12_18 OWNER TO supabase_admin;

--
-- Name: messages_2025_12_19; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_12_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_12_19 OWNER TO supabase_admin;

--
-- Name: messages_2025_12_20; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_12_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_12_20 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: iceberg_namespaces; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_namespaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_namespaces OWNER TO supabase_storage_admin;

--
-- Name: iceberg_tables; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.iceberg_tables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace_id uuid NOT NULL,
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.iceberg_tables OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: messages_2025_12_16; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_16 FOR VALUES FROM ('2025-12-16 00:00:00') TO ('2025-12-17 00:00:00');


--
-- Name: messages_2025_12_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_17 FOR VALUES FROM ('2025-12-17 00:00:00') TO ('2025-12-18 00:00:00');


--
-- Name: messages_2025_12_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_18 FOR VALUES FROM ('2025-12-18 00:00:00') TO ('2025-12-19 00:00:00');


--
-- Name: messages_2025_12_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_19 FOR VALUES FROM ('2025-12-19 00:00:00') TO ('2025-12-20 00:00:00');


--
-- Name: messages_2025_12_20; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_20 FOR VALUES FROM ('2025-12-20 00:00:00') TO ('2025-12-21 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: eventos_sistema id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_sistema ALTER COLUMN id SET DEFAULT nextval('public.eventos_sistema_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: auditoria_transacciones auditoria_transacciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_transacciones
    ADD CONSTRAINT auditoria_transacciones_pkey PRIMARY KEY (id);


--
-- Name: cajas_operativas cajas_operativas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas_operativas
    ADD CONSTRAINT cajas_operativas_pkey PRIMARY KEY (id);


--
-- Name: categorias_garantia categorias_garantia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias_garantia
    ADD CONSTRAINT categorias_garantia_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_numero_documento_key UNIQUE (numero_documento);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: contratos_fondeo contratos_fondeo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos_fondeo
    ADD CONSTRAINT contratos_fondeo_pkey PRIMARY KEY (id);


--
-- Name: creditos creditos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_codigo_key UNIQUE (codigo);


--
-- Name: creditos creditos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_pkey PRIMARY KEY (id);


--
-- Name: cuentas_financieras cuentas_financieras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_financieras
    ADD CONSTRAINT cuentas_financieras_pkey PRIMARY KEY (id);


--
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (codigo);


--
-- Name: distritos distritos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distritos
    ADD CONSTRAINT distritos_pkey PRIMARY KEY (ubigeo_inei);


--
-- Name: empleados empleados_persona_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_persona_id_unique UNIQUE (persona_id);


--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);


--
-- Name: empleados empleados_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_user_id_key UNIQUE (user_id);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);


--
-- Name: empresas empresas_ruc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_ruc_key UNIQUE (ruc);


--
-- Name: eventos_sistema eventos_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_sistema
    ADD CONSTRAINT eventos_sistema_pkey PRIMARY KEY (id);


--
-- Name: garantias garantias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_pkey PRIMARY KEY (id);


--
-- Name: inversionistas inversionistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inversionistas
    ADD CONSTRAINT inversionistas_pkey PRIMARY KEY (id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_pkey PRIMARY KEY (id);


--
-- Name: notificaciones_enviadas notificaciones_enviadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_enviadas
    ADD CONSTRAINT notificaciones_enviadas_pkey PRIMARY KEY (id);


--
-- Name: notificaciones_pendientes notificaciones_pendientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_pendientes
    ADD CONSTRAINT notificaciones_pendientes_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: personas personas_numero_documento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_numero_documento_key UNIQUE (numero_documento);


--
-- Name: personas personas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personas
    ADD CONSTRAINT personas_pkey PRIMARY KEY (id);


--
-- Name: provincias provincias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provincias
    ADD CONSTRAINT provincias_pkey PRIMARY KEY (codigo);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sugerencias_catalogos sugerencias_catalogos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencias_catalogos
    ADD CONSTRAINT sugerencias_catalogos_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: transacciones_capital transacciones_capital_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_capital
    ADD CONSTRAINT transacciones_capital_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: verificacion_whatsapp verificacion_whatsapp_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verificacion_whatsapp
    ADD CONSTRAINT verificacion_whatsapp_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_16 messages_2025_12_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_12_16
    ADD CONSTRAINT messages_2025_12_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_17 messages_2025_12_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_12_17
    ADD CONSTRAINT messages_2025_12_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_18 messages_2025_12_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_12_18
    ADD CONSTRAINT messages_2025_12_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_19 messages_2025_12_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_12_19
    ADD CONSTRAINT messages_2025_12_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_20 messages_2025_12_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_12_20
    ADD CONSTRAINT messages_2025_12_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: iceberg_namespaces iceberg_namespaces_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_pkey PRIMARY KEY (id);


--
-- Name: iceberg_tables iceberg_tables_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_audit_log_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_created ON public.audit_log USING btree (created_at DESC);


--
-- Name: idx_audit_log_registro; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_registro ON public.audit_log USING btree (registro_id);


--
-- Name: idx_audit_log_tabla; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_tabla ON public.audit_log USING btree (tabla);


--
-- Name: idx_audit_log_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_log_usuario ON public.audit_log USING btree (usuario_id);


--
-- Name: idx_auditoria_empleado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_empleado ON public.auditoria_transacciones USING btree (empleado_id);


--
-- Name: idx_auditoria_registro; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_registro ON public.auditoria_transacciones USING btree (registro_id);


--
-- Name: idx_auditoria_tabla; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_tabla ON public.auditoria_transacciones USING btree (tabla_afectada);


--
-- Name: idx_auditoria_tabla_registro; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_tabla_registro ON public.auditoria_transacciones USING btree (tabla_afectada, registro_id);


--
-- Name: idx_auditoria_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_timestamp ON public.auditoria_transacciones USING btree ("timestamp" DESC);


--
-- Name: idx_auditoria_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auditoria_usuario ON public.auditoria_transacciones USING btree (usuario_id);


--
-- Name: idx_cajas_operativas_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cajas_operativas_estado ON public.cajas_operativas USING btree (estado);


--
-- Name: idx_cajas_operativas_fecha_apertura; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cajas_operativas_fecha_apertura ON public.cajas_operativas USING btree (fecha_apertura);


--
-- Name: idx_cajas_operativas_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cajas_operativas_usuario ON public.cajas_operativas USING btree (usuario_id);


--
-- Name: idx_cajas_usuario_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cajas_usuario_estado ON public.cajas_operativas USING btree (usuario_id, estado);


--
-- Name: INDEX idx_cajas_usuario_estado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_cajas_usuario_estado IS 'Optimiza: buscar caja abierta de usuario (muy frecuente)';


--
-- Name: idx_clientes_activo_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_activo_created ON public.clientes USING btree (activo, created_at DESC);


--
-- Name: idx_clientes_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_deleted ON public.clientes USING btree (_deleted) WHERE (_deleted = false);


--
-- Name: idx_clientes_documento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_documento ON public.clientes USING btree (numero_documento);


--
-- Name: idx_clientes_modified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_modified ON public.clientes USING btree (_modified);


--
-- Name: idx_clientes_persona; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clientes_persona ON public.clientes USING btree (persona_id);


--
-- Name: idx_contratos_fondeo_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_fondeo_estado ON public.contratos_fondeo USING btree (estado) WHERE (estado = 'ACTIVO'::public.estado_contrato_fondeo);


--
-- Name: idx_contratos_fondeo_inversionista; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_fondeo_inversionista ON public.contratos_fondeo USING btree (inversionista_id);


--
-- Name: idx_contratos_fondeo_vencimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contratos_fondeo_vencimiento ON public.contratos_fondeo USING btree (fecha_vencimiento) WHERE (fecha_vencimiento IS NOT NULL);


--
-- Name: idx_creditos_caja_origen; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_caja_origen ON public.creditos USING btree (caja_origen_id);


--
-- Name: idx_creditos_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_cliente ON public.creditos USING btree (cliente_id);


--
-- Name: idx_creditos_cliente_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_cliente_estado ON public.creditos USING btree (cliente_id, estado);


--
-- Name: INDEX idx_creditos_cliente_estado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_creditos_cliente_estado IS 'Optimiza: buscar créditos de cliente por estado';


--
-- Name: idx_creditos_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_codigo ON public.creditos USING btree (codigo_credito);


--
-- Name: idx_creditos_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_deleted ON public.creditos USING btree (_deleted) WHERE (_deleted = false);


--
-- Name: idx_creditos_dias_transcurridos; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_dias_transcurridos ON public.creditos USING btree (dias_transcurridos);


--
-- Name: idx_creditos_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_estado ON public.creditos USING btree (estado);


--
-- Name: idx_creditos_estado_detallado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_estado_detallado ON public.creditos USING btree (estado_detallado);


--
-- Name: INDEX idx_creditos_estado_detallado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_creditos_estado_detallado IS 'Optimiza: filtrar por estado_detallado en dashboard';


--
-- Name: idx_creditos_estado_vencimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_estado_vencimiento ON public.creditos USING btree (estado, fecha_vencimiento);


--
-- Name: INDEX idx_creditos_estado_vencimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_creditos_estado_vencimiento IS 'Optimiza semáforo de riesgo (filtrado por estado)';


--
-- Name: idx_creditos_fecha_vencimiento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_fecha_vencimiento ON public.creditos USING btree (fecha_vencimiento);


--
-- Name: INDEX idx_creditos_fecha_vencimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON INDEX public.idx_creditos_fecha_vencimiento IS 'Optimiza: ordenar créditos por vencimiento';


--
-- Name: idx_creditos_modified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_creditos_modified ON public.creditos USING btree (_modified);


--
-- Name: idx_cuentas_financieras_single_principal; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_cuentas_financieras_single_principal ON public.cuentas_financieras USING btree (es_principal) WHERE (es_principal = true);


--
-- Name: idx_empleados_cargo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empleados_cargo ON public.empleados USING btree (cargo);


--
-- Name: idx_empleados_persona; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empleados_persona ON public.empleados USING btree (persona_id);


--
-- Name: idx_empleados_persona_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empleados_persona_id ON public.empleados USING btree (persona_id);


--
-- Name: idx_empleados_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_empleados_user_id ON public.empleados USING btree (user_id);


--
-- Name: idx_eventos_agregado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_eventos_agregado ON public.eventos_sistema USING btree (agregado_tipo, agregado_id);


--
-- Name: idx_garantias_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_cliente ON public.garantias USING btree (cliente_id);


--
-- Name: idx_garantias_credito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_credito ON public.garantias USING btree (credito_id);


--
-- Name: idx_garantias_credito_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_credito_id ON public.garantias USING btree (credito_id);


--
-- Name: idx_garantias_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_deleted ON public.garantias USING btree (_deleted) WHERE (_deleted = false);


--
-- Name: idx_garantias_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_estado ON public.garantias USING btree (estado);


--
-- Name: idx_garantias_modified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_garantias_modified ON public.garantias USING btree (_modified);


--
-- Name: idx_movimientos_anulado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_anulado ON public.movimientos_caja_operativa USING btree (anulado);


--
-- Name: idx_movimientos_caja_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_created ON public.movimientos_caja_operativa USING btree (caja_operativa_id, fecha DESC);


--
-- Name: idx_movimientos_caja_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_id ON public.movimientos_caja_operativa USING btree (caja_id);


--
-- Name: idx_movimientos_caja_operativa_caja; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_operativa_caja ON public.movimientos_caja_operativa USING btree (caja_operativa_id);


--
-- Name: idx_movimientos_caja_operativa_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_operativa_fecha ON public.movimientos_caja_operativa USING btree (fecha);


--
-- Name: idx_movimientos_caja_operativa_referencia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_operativa_referencia ON public.movimientos_caja_operativa USING btree (referencia_id);


--
-- Name: idx_movimientos_caja_operativa_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_operativa_tipo ON public.movimientos_caja_operativa USING btree (tipo);


--
-- Name: idx_movimientos_caja_operativa_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_caja_operativa_usuario ON public.movimientos_caja_operativa USING btree (usuario_id);


--
-- Name: idx_movimientos_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_deleted ON public.movimientos_caja_operativa USING btree (_deleted) WHERE (_deleted = false);


--
-- Name: idx_movimientos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_fecha ON public.movimientos_caja_operativa USING btree (fecha DESC);


--
-- Name: idx_movimientos_modified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_movimientos_modified ON public.movimientos_caja_operativa USING btree (_modified);


--
-- Name: idx_notif_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_cliente ON public.notificaciones_pendientes USING btree (cliente_id);


--
-- Name: idx_notif_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_estado ON public.notificaciones_pendientes USING btree (estado);


--
-- Name: idx_notif_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_tipo ON public.notificaciones_pendientes USING btree (tipo);


--
-- Name: idx_notificaciones_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_cliente ON public.notificaciones_enviadas USING btree (cliente_id);


--
-- Name: idx_notificaciones_credito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_credito ON public.notificaciones_enviadas USING btree (credito_id);


--
-- Name: idx_notificaciones_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notificaciones_fecha ON public.notificaciones_enviadas USING btree (fecha_envio DESC);


--
-- Name: idx_pagos_anulado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_anulado ON public.pagos USING btree (anulado);


--
-- Name: idx_pagos_caja; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_caja ON public.pagos USING btree (caja_operativa_id);


--
-- Name: idx_pagos_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_created_at ON public.pagos USING btree (created_at);


--
-- Name: idx_pagos_credito; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_credito ON public.pagos USING btree (credito_id);


--
-- Name: idx_pagos_credito_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_credito_id ON public.pagos USING btree (credito_id);


--
-- Name: idx_pagos_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_deleted ON public.pagos USING btree (_deleted) WHERE (_deleted = false);


--
-- Name: idx_pagos_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_fecha ON public.pagos USING btree (fecha_pago DESC);


--
-- Name: idx_pagos_modified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_modified ON public.pagos USING btree (_modified);


--
-- Name: idx_pagos_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_tipo ON public.pagos USING btree (tipo);


--
-- Name: idx_pagos_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_usuario ON public.pagos USING btree (usuario_id);


--
-- Name: idx_pagos_usuario_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pagos_usuario_id ON public.pagos USING btree (usuario_id);


--
-- Name: idx_personas_apellido_paterno; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personas_apellido_paterno ON public.personas USING btree (apellido_paterno);


--
-- Name: idx_personas_documento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personas_documento ON public.personas USING btree (numero_documento);


--
-- Name: idx_personas_nombres; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personas_nombres ON public.personas USING btree (nombres);


--
-- Name: idx_personas_numero_documento; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personas_numero_documento ON public.personas USING btree (numero_documento);


--
-- Name: idx_system_settings_updated; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_settings_updated ON public.system_settings USING btree (updated_at);


--
-- Name: idx_transacciones_voucher_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_transacciones_voucher_unique ON public.transacciones_capital USING btree (numero_operacion, destino_cuenta_id) WHERE (numero_operacion IS NOT NULL);


--
-- Name: idx_unique_active_caja; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_unique_active_caja ON public.cajas_operativas USING btree (usuario_id) WHERE ((estado)::text = 'abierta'::text);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (rol);


--
-- Name: idx_verificacion_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verificacion_codigo ON public.verificacion_whatsapp USING btree (telefono, codigo) WHERE (verificado = false);


--
-- Name: idx_verificacion_expira; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verificacion_expira ON public.verificacion_whatsapp USING btree (expira_en);


--
-- Name: idx_verificacion_telefono; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_verificacion_telefono ON public.verificacion_whatsapp USING btree (telefono);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_12_16_inserted_at_topic_idx ON realtime.messages_2025_12_16 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_12_17_inserted_at_topic_idx ON realtime.messages_2025_12_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_12_18_inserted_at_topic_idx ON realtime.messages_2025_12_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_12_19_inserted_at_topic_idx ON realtime.messages_2025_12_19 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_12_20_inserted_at_topic_idx ON realtime.messages_2025_12_20 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_iceberg_namespaces_bucket_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_namespaces_bucket_id ON storage.iceberg_namespaces USING btree (bucket_id, name);


--
-- Name: idx_iceberg_tables_namespace_id; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_iceberg_tables_namespace_id ON storage.iceberg_tables USING btree (namespace_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_12_16_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_16_inserted_at_topic_idx;


--
-- Name: messages_2025_12_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_16_pkey;


--
-- Name: messages_2025_12_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_17_inserted_at_topic_idx;


--
-- Name: messages_2025_12_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_17_pkey;


--
-- Name: messages_2025_12_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_18_inserted_at_topic_idx;


--
-- Name: messages_2025_12_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_18_pkey;


--
-- Name: messages_2025_12_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_19_inserted_at_topic_idx;


--
-- Name: messages_2025_12_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_19_pkey;


--
-- Name: messages_2025_12_20_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_20_inserted_at_topic_idx;


--
-- Name: messages_2025_12_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_20_pkey;


--
-- Name: cajas_operativas audit_cajas; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_cajas AFTER INSERT OR DELETE OR UPDATE ON public.cajas_operativas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: creditos audit_creditos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_creditos AFTER INSERT OR DELETE OR UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: empleados audit_empleados; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_empleados AFTER INSERT OR DELETE OR UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: garantias audit_garantias; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_garantias AFTER INSERT OR DELETE OR UPDATE ON public.garantias FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: pagos audit_pagos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_pagos AFTER INSERT OR DELETE OR UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: personas audit_personas; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER audit_personas AFTER INSERT OR DELETE OR UPDATE ON public.personas FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();


--
-- Name: empleados empleados_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER empleados_updated_at_trigger BEFORE UPDATE ON public.empleados FOR EACH ROW EXECUTE FUNCTION public.update_personas_updated_at();


--
-- Name: personas personas_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER personas_updated_at_trigger BEFORE UPDATE ON public.personas FOR EACH ROW EXECUTE FUNCTION public.update_personas_updated_at();


--
-- Name: transacciones_capital trg_audit_metadata_capital; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_audit_metadata_capital AFTER UPDATE ON public.transacciones_capital FOR EACH ROW EXECUTE FUNCTION public.fn_audit_metadata_changes();


--
-- Name: cajas_operativas trg_auto_liquidar_caja; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_auto_liquidar_caja AFTER UPDATE ON public.cajas_operativas FOR EACH ROW WHEN (((old.estado)::text IS DISTINCT FROM (new.estado)::text)) EXECUTE FUNCTION public.fn_liquidar_caja_cerrada();


--
-- Name: contratos_fondeo trg_contratos_fondeo_updated; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_contratos_fondeo_updated BEFORE UPDATE ON public.contratos_fondeo FOR EACH ROW EXECUTE FUNCTION public.fn_update_contratos_fondeo_timestamp();


--
-- Name: transacciones_capital trg_ledger_smart_lock; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_ledger_smart_lock BEFORE DELETE OR UPDATE ON public.transacciones_capital FOR EACH ROW EXECUTE FUNCTION public.fn_protect_ledger_integrity();


--
-- Name: movimientos_caja_operativa trg_movimiento_caja_update_saldo; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_movimiento_caja_update_saldo AFTER INSERT ON public.movimientos_caja_operativa FOR EACH ROW EXECUTE FUNCTION public.fn_update_caja_operativa_saldo();


--
-- Name: pagos trg_procesar_pago_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_procesar_pago_insert BEFORE INSERT ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.procesar_pago_trigger_fn();


--
-- Name: creditos trg_security_sod_creditos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_security_sod_creditos BEFORE INSERT OR UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.security_prevent_self_credit();


--
-- Name: pagos trg_security_sod_pagos; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_security_sod_pagos BEFORE INSERT ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.security_prevent_self_payment();


--
-- Name: creditos trg_security_validate_client_active; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_security_validate_client_active BEFORE INSERT ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.check_client_status_before_credit();


--
-- Name: movimientos_caja_operativa trg_sync_caja_ids; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_sync_caja_ids BEFORE INSERT OR UPDATE ON public.movimientos_caja_operativa FOR EACH ROW EXECUTE FUNCTION public.sync_caja_ids();


--
-- Name: transacciones_capital trg_transaccion_capital_update_saldo; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_transaccion_capital_update_saldo AFTER INSERT ON public.transacciones_capital FOR EACH ROW EXECUTE FUNCTION public.fn_update_cuentas_financieras_saldo();


--
-- Name: pagos trg_update_saldo_credito; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_saldo_credito AFTER INSERT ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.update_saldo_credito_on_pago();


--
-- Name: creditos trigger_actualizar_estado_credito; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_estado_credito BEFORE INSERT OR UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.actualizar_estado_credito();


--
-- Name: creditos trigger_actualizar_interes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_actualizar_interes BEFORE INSERT OR UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.actualizar_interes_devengado();


--
-- Name: creditos trigger_validate_credito_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validate_credito_update BEFORE UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION public.validate_credito_update();


--
-- Name: pagos trigger_validate_pago_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_validate_pago_insert BEFORE INSERT ON public.pagos FOR EACH ROW EXECUTE FUNCTION public.validate_pago_insert();


--
-- Name: cajas_operativas update_cajas_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cajas_modified BEFORE UPDATE ON public.cajas_operativas FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: clientes update_clientes_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_clientes_modified BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: creditos update_creditos_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_creditos_modified BEFORE UPDATE ON public.creditos FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: garantias update_garantias_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_garantias_modified BEFORE UPDATE ON public.garantias FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: movimientos_caja_operativa update_movimientos_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_movimientos_modified BEFORE UPDATE ON public.movimientos_caja_operativa FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: pagos update_pagos_modified; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_pagos_modified BEFORE UPDATE ON public.pagos FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('_modified');


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: audit_log audit_log_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: auditoria_transacciones auditoria_transacciones_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_transacciones
    ADD CONSTRAINT auditoria_transacciones_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id);


--
-- Name: auditoria_transacciones auditoria_transacciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_transacciones
    ADD CONSTRAINT auditoria_transacciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: cajas_operativas cajas_operativas_cuenta_origen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas_operativas
    ADD CONSTRAINT cajas_operativas_cuenta_origen_id_fkey FOREIGN KEY (cuenta_origen_id) REFERENCES public.cuentas_financieras(id);


--
-- Name: cajas_operativas cajas_operativas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas_operativas
    ADD CONSTRAINT cajas_operativas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: clientes clientes_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: clientes clientes_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id);


--
-- Name: contratos_fondeo contratos_fondeo_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos_fondeo
    ADD CONSTRAINT contratos_fondeo_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: contratos_fondeo contratos_fondeo_inversionista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contratos_fondeo
    ADD CONSTRAINT contratos_fondeo_inversionista_id_fkey FOREIGN KEY (inversionista_id) REFERENCES public.inversionistas(id) ON DELETE RESTRICT;


--
-- Name: creditos creditos_caja_origen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_caja_origen_id_fkey FOREIGN KEY (caja_origen_id) REFERENCES public.cajas_operativas(id);


--
-- Name: creditos creditos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: creditos creditos_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: creditos creditos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creditos
    ADD CONSTRAINT creditos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id);


--
-- Name: distritos distritos_provincia_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distritos
    ADD CONSTRAINT distritos_provincia_codigo_fkey FOREIGN KEY (provincia_codigo) REFERENCES public.provincias(codigo);


--
-- Name: empleados empleados_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id) ON DELETE CASCADE;


--
-- Name: empleados empleados_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: eventos_sistema eventos_sistema_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eventos_sistema
    ADD CONSTRAINT eventos_sistema_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: garantias garantias_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_garantia(id);


--
-- Name: garantias garantias_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: garantias garantias_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_credito_id_fkey FOREIGN KEY (credito_id) REFERENCES public.creditos(id);


--
-- Name: inversionistas inversionistas_persona_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inversionistas
    ADD CONSTRAINT inversionistas_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_anulado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_anulado_por_fkey FOREIGN KEY (anulado_por) REFERENCES auth.users(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_caja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_caja_id_fkey FOREIGN KEY (caja_id) REFERENCES public.cajas_operativas(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_caja_operativa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_caja_operativa_id_fkey FOREIGN KEY (caja_operativa_id) REFERENCES public.cajas_operativas(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_movimiento_original_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_movimiento_original_id_fkey FOREIGN KEY (movimiento_original_id) REFERENCES public.movimientos_caja_operativa(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_movimiento_reversion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_movimiento_reversion_id_fkey FOREIGN KEY (movimiento_reversion_id) REFERENCES public.movimientos_caja_operativa(id);


--
-- Name: movimientos_caja_operativa movimientos_caja_operativa_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja_operativa
    ADD CONSTRAINT movimientos_caja_operativa_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: notificaciones_enviadas notificaciones_enviadas_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_enviadas
    ADD CONSTRAINT notificaciones_enviadas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: notificaciones_enviadas notificaciones_enviadas_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_enviadas
    ADD CONSTRAINT notificaciones_enviadas_credito_id_fkey FOREIGN KEY (credito_id) REFERENCES public.creditos(id) ON DELETE CASCADE;


--
-- Name: notificaciones_enviadas notificaciones_enviadas_enviado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_enviadas
    ADD CONSTRAINT notificaciones_enviadas_enviado_por_fkey FOREIGN KEY (enviado_por) REFERENCES auth.users(id);


--
-- Name: notificaciones_pendientes notificaciones_pendientes_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_pendientes
    ADD CONSTRAINT notificaciones_pendientes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id);


--
-- Name: notificaciones_pendientes notificaciones_pendientes_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones_pendientes
    ADD CONSTRAINT notificaciones_pendientes_credito_id_fkey FOREIGN KEY (credito_id) REFERENCES public.creditos(id);


--
-- Name: pagos pagos_anulado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_anulado_por_fkey FOREIGN KEY (anulado_por) REFERENCES auth.users(id);


--
-- Name: pagos pagos_caja_operativa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_caja_operativa_id_fkey FOREIGN KEY (caja_operativa_id) REFERENCES public.cajas_operativas(id);


--
-- Name: pagos pagos_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_credito_id_fkey FOREIGN KEY (credito_id) REFERENCES public.creditos(id);


--
-- Name: pagos pagos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id);


--
-- Name: provincias provincias_departamento_codigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provincias
    ADD CONSTRAINT provincias_departamento_codigo_fkey FOREIGN KEY (departamento_codigo) REFERENCES public.departamentos(codigo);


--
-- Name: sugerencias_catalogos sugerencias_catalogos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sugerencias_catalogos
    ADD CONSTRAINT sugerencias_catalogos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: transacciones_capital transacciones_capital_destino_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_capital
    ADD CONSTRAINT transacciones_capital_destino_cuenta_id_fkey FOREIGN KEY (destino_cuenta_id) REFERENCES public.cuentas_financieras(id);


--
-- Name: transacciones_capital transacciones_capital_inversionista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_capital
    ADD CONSTRAINT transacciones_capital_inversionista_id_fkey FOREIGN KEY (inversionista_id) REFERENCES public.inversionistas(id);


--
-- Name: transacciones_capital transacciones_capital_origen_cuenta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transacciones_capital
    ADD CONSTRAINT transacciones_capital_origen_cuenta_id_fkey FOREIGN KEY (origen_cuenta_id) REFERENCES public.cuentas_financieras(id);


--
-- Name: usuarios usuarios_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id);


--
-- Name: verificacion_whatsapp verificacion_whatsapp_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verificacion_whatsapp
    ADD CONSTRAINT verificacion_whatsapp_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES auth.users(id);


--
-- Name: iceberg_namespaces iceberg_namespaces_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_namespaces
    ADD CONSTRAINT iceberg_namespaces_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_analytics(id) ON DELETE CASCADE;


--
-- Name: iceberg_tables iceberg_tables_namespace_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.iceberg_tables
    ADD CONSTRAINT iceberg_tables_namespace_id_fkey FOREIGN KEY (namespace_id) REFERENCES storage.iceberg_namespaces(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: contratos_fondeo Admin full access contratos_fondeo; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin full access contratos_fondeo" ON public.contratos_fondeo TO authenticated USING (true) WITH CHECK (true);


--
-- Name: cajas_operativas Admin ve todo cajas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admin ve todo cajas" ON public.cajas_operativas USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.rol)::text = 'admin'::text)))));


--
-- Name: audit_log Admins can read audit_log; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can read audit_log" ON public.audit_log FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.rol)::text = ANY (ARRAY[('admin'::character varying)::text, ('super_admin'::character varying)::text]))))));


--
-- Name: audit_log Authenticated users can insert audit_log; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert audit_log" ON public.audit_log FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: notificaciones_pendientes Authenticated users can manage notificaciones; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can manage notificaciones" ON public.notificaciones_pendientes USING ((auth.uid() IS NOT NULL));


--
-- Name: cajas_operativas Cajero ve su propia caja; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Cajero ve su propia caja" ON public.cajas_operativas FOR SELECT USING ((usuario_id = auth.uid()));


--
-- Name: system_settings Lectura config; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Lectura config" ON public.system_settings FOR SELECT USING (true);


--
-- Name: verificacion_whatsapp Service role can do everything; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Service role can do everything" ON public.verificacion_whatsapp USING (true) WITH CHECK (true);


--
-- Name: system_settings Solo admins actualizan config; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Solo admins actualizan config" ON public.system_settings FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.rol)::text = 'admin'::text)))));


--
-- Name: cajas_operativas admin_all_cajas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_cajas ON public.cajas_operativas TO authenticated USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])));


--
-- Name: clientes admin_all_clientes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_clientes ON public.clientes USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--
-- Name: creditos admin_all_creditos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_creditos ON public.creditos TO authenticated USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])));


--
-- Name: cuentas_financieras admin_all_cuentas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_cuentas ON public.cuentas_financieras TO authenticated USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])));


--
-- Name: garantias admin_all_garantias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_garantias ON public.garantias USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--
-- Name: inversionistas admin_all_inversionistas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_inversionistas ON public.inversionistas USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--
-- Name: pagos admin_all_pagos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_pagos ON public.pagos TO authenticated USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])));


--
-- Name: personas admin_all_personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_personas ON public.personas USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--
-- Name: transacciones_capital admin_all_tx; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_tx ON public.transacciones_capital TO authenticated USING ((public.get_user_role() = ANY (ARRAY['admin'::text, 'gerente'::text])));


--
-- Name: usuarios admin_all_usuarios; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY admin_all_usuarios ON public.usuarios USING ((public.get_user_role() = 'admin'::text)) WITH CHECK ((public.get_user_role() = 'admin'::text));


--
-- Name: audit_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: cajas_operativas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cajas_operativas ENABLE ROW LEVEL SECURITY;

--
-- Name: cajas_operativas cajero_close_own_caja; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_close_own_caja ON public.cajas_operativas FOR UPDATE TO authenticated USING ((usuario_id = auth.uid())) WITH CHECK ((usuario_id = auth.uid()));


--
-- Name: clientes cajero_insert_clientes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_insert_clientes ON public.clientes FOR INSERT WITH CHECK ((public.get_user_role() = 'cajero'::text));


--
-- Name: garantias cajero_insert_garantias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_insert_garantias ON public.garantias FOR INSERT WITH CHECK ((public.get_user_role() = 'cajero'::text));


--
-- Name: pagos cajero_insert_pagos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_insert_pagos ON public.pagos FOR INSERT TO authenticated WITH CHECK ((public.get_user_role() = 'CAJERO'::text));


--
-- Name: personas cajero_insert_personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_insert_personas ON public.personas FOR INSERT WITH CHECK ((public.get_user_role() = 'cajero'::text));


--
-- Name: cajas_operativas cajero_own_caja; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_own_caja ON public.cajas_operativas FOR SELECT TO authenticated USING ((usuario_id = auth.uid()));


--
-- Name: clientes cajero_read_clientes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_read_clientes ON public.clientes FOR SELECT USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: garantias cajero_read_garantias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_read_garantias ON public.garantias FOR SELECT USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: personas cajero_read_personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_read_personas ON public.personas FOR SELECT USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: clientes cajero_update_clientes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_update_clientes ON public.clientes FOR UPDATE USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: garantias cajero_update_garantias; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_update_garantias ON public.garantias FOR UPDATE USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: personas cajero_update_personas; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_update_personas ON public.personas FOR UPDATE USING ((public.get_user_role() = 'cajero'::text));


--
-- Name: creditos cajero_view_creditos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_view_creditos ON public.creditos FOR SELECT TO authenticated USING ((public.get_user_role() = 'CAJERO'::text));


--
-- Name: pagos cajero_view_pagos; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY cajero_view_pagos ON public.pagos FOR SELECT TO authenticated USING ((public.get_user_role() = 'CAJERO'::text));


--
-- Name: clientes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

--
-- Name: contratos_fondeo; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.contratos_fondeo ENABLE ROW LEVEL SECURITY;

--
-- Name: creditos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.creditos ENABLE ROW LEVEL SECURITY;

--
-- Name: cuentas_financieras; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.cuentas_financieras ENABLE ROW LEVEL SECURITY;

--
-- Name: garantias; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;

--
-- Name: inversionistas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.inversionistas ENABLE ROW LEVEL SECURITY;

--
-- Name: movimientos_caja_operativa; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.movimientos_caja_operativa ENABLE ROW LEVEL SECURITY;

--
-- Name: movimientos_caja_operativa movimientos_insert_authenticated; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY movimientos_insert_authenticated ON public.movimientos_caja_operativa FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: POLICY movimientos_insert_authenticated ON movimientos_caja_operativa; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON POLICY movimientos_insert_authenticated ON public.movimientos_caja_operativa IS 'Permite a usuarios autenticados insertar movimientos de caja. El control de acceso es validado en código.';


--
-- Name: movimientos_caja_operativa movimientos_select_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY movimientos_select_admin ON public.movimientos_caja_operativa FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.usuarios
  WHERE ((usuarios.id = auth.uid()) AND ((usuarios.rol)::text = ANY (ARRAY[('admin'::character varying)::text, ('gerente'::character varying)::text]))))));


--
-- Name: movimientos_caja_operativa movimientos_select_own_caja; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY movimientos_select_own_caja ON public.movimientos_caja_operativa FOR SELECT TO authenticated USING ((caja_operativa_id IN ( SELECT cajas_operativas.id
   FROM public.cajas_operativas
  WHERE (cajas_operativas.usuario_id = auth.uid()))));


--
-- Name: notificaciones_pendientes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notificaciones_pendientes ENABLE ROW LEVEL SECURITY;

--
-- Name: pagos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

--
-- Name: personas; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: transacciones_capital; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.transacciones_capital ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

--
-- Name: usuarios usuarios_read_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY usuarios_read_own ON public.usuarios FOR SELECT USING ((auth.uid() = id));


--
-- Name: verificacion_whatsapp; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.verificacion_whatsapp ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_namespaces; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_namespaces ENABLE ROW LEVEL SECURITY;

--
-- Name: iceberg_tables; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.iceberg_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime clientes; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.clientes;


--
-- Name: supabase_realtime creditos; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.creditos;


--
-- Name: supabase_realtime garantias; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.garantias;


--
-- Name: supabase_realtime movimientos_caja_operativa; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.movimientos_caja_operativa;


--
-- Name: supabase_realtime pagos; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.pagos;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION moddatetime(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.moddatetime() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- Name: FUNCTION actualizar_estado_credito(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.actualizar_estado_credito() TO anon;
GRANT ALL ON FUNCTION public.actualizar_estado_credito() TO authenticated;
GRANT ALL ON FUNCTION public.actualizar_estado_credito() TO service_role;


--
-- Name: FUNCTION actualizar_interes_devengado(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.actualizar_interes_devengado() TO anon;
GRANT ALL ON FUNCTION public.actualizar_interes_devengado() TO authenticated;
GRANT ALL ON FUNCTION public.actualizar_interes_devengado() TO service_role;


--
-- Name: FUNCTION admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text) TO anon;
GRANT ALL ON FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text) TO authenticated;
GRANT ALL ON FUNCTION public.admin_asignar_caja(p_usuario_cajero_id uuid, p_monto numeric, p_observacion text) TO service_role;


--
-- Name: FUNCTION admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb) TO anon;
GRANT ALL ON FUNCTION public.admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.admin_inyectar_capital(p_monto numeric, p_origen text, p_referencia text, p_metadata jsonb) TO service_role;


--
-- Name: FUNCTION anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.anular_pago(p_pago_id uuid, p_motivo text, p_usuario_id uuid) TO service_role;


--
-- Name: FUNCTION audit_trigger_function(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.audit_trigger_function() TO anon;
GRANT ALL ON FUNCTION public.audit_trigger_function() TO authenticated;
GRANT ALL ON FUNCTION public.audit_trigger_function() TO service_role;


--
-- Name: FUNCTION buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.buscar_clientes_con_creditos(p_search_term text, p_is_dni boolean, p_limit integer) TO service_role;


--
-- Name: FUNCTION calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date) TO anon;
GRANT ALL ON FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date) TO authenticated;
GRANT ALL ON FUNCTION public.calcular_interes_actual(p_credito_id uuid, p_fecha_calculo date) TO service_role;


--
-- Name: FUNCTION calcular_saldo_caja(p_caja_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calcular_saldo_caja(p_caja_id uuid) TO anon;
GRANT ALL ON FUNCTION public.calcular_saldo_caja(p_caja_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calcular_saldo_caja(p_caja_id uuid) TO service_role;


--
-- Name: FUNCTION cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text) TO anon;
GRANT ALL ON FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text) TO authenticated;
GRANT ALL ON FUNCTION public.cerrar_caja_oficial(p_caja_id uuid, p_monto_fisico numeric, p_observaciones text) TO service_role;


--
-- Name: FUNCTION check_client_status_before_credit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_client_status_before_credit() TO anon;
GRANT ALL ON FUNCTION public.check_client_status_before_credit() TO authenticated;
GRANT ALL ON FUNCTION public.check_client_status_before_credit() TO service_role;


--
-- Name: FUNCTION check_saldos_boveda(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.check_saldos_boveda() TO anon;
GRANT ALL ON FUNCTION public.check_saldos_boveda() TO authenticated;
GRANT ALL ON FUNCTION public.check_saldos_boveda() TO service_role;


--
-- Name: FUNCTION conciliar_caja_dia(p_fecha date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.conciliar_caja_dia(p_fecha date) TO anon;
GRANT ALL ON FUNCTION public.conciliar_caja_dia(p_fecha date) TO authenticated;
GRANT ALL ON FUNCTION public.conciliar_caja_dia(p_fecha date) TO service_role;


--
-- Name: FUNCTION crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) TO anon;
GRANT ALL ON FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.crear_contrato_oficial(p_caja_id uuid, p_cliente_doc_tipo text, p_cliente_doc_num text, p_cliente_nombre text, p_garantia_data jsonb, p_contrato_data jsonb) TO service_role;


--
-- Name: FUNCTION crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid) TO anon;
GRANT ALL ON FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.crear_credito_completo(p_cliente_id uuid, p_monto_prestamo numeric, p_valor_tasacion numeric, p_tasa_interes numeric, p_periodo_dias integer, p_fecha_inicio timestamp with time zone, p_descripcion_garantia text, p_fotos text[], p_observaciones text, p_usuario_id uuid, p_caja_id uuid) TO service_role;


--
-- Name: FUNCTION detectar_actividad_sospechosa(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.detectar_actividad_sospechosa() TO anon;
GRANT ALL ON FUNCTION public.detectar_actividad_sospechosa() TO authenticated;
GRANT ALL ON FUNCTION public.detectar_actividad_sospechosa() TO service_role;


--
-- Name: FUNCTION detectar_descuadres(p_ultimos_dias integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.detectar_descuadres(p_ultimos_dias integer) TO anon;
GRANT ALL ON FUNCTION public.detectar_descuadres(p_ultimos_dias integer) TO authenticated;
GRANT ALL ON FUNCTION public.detectar_descuadres(p_ultimos_dias integer) TO service_role;


--
-- Name: FUNCTION fn_audit_metadata_changes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_audit_metadata_changes() TO anon;
GRANT ALL ON FUNCTION public.fn_audit_metadata_changes() TO authenticated;
GRANT ALL ON FUNCTION public.fn_audit_metadata_changes() TO service_role;


--
-- Name: FUNCTION fn_liquidar_caja_cerrada(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_liquidar_caja_cerrada() TO anon;
GRANT ALL ON FUNCTION public.fn_liquidar_caja_cerrada() TO authenticated;
GRANT ALL ON FUNCTION public.fn_liquidar_caja_cerrada() TO service_role;


--
-- Name: FUNCTION fn_protect_ledger_integrity(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_protect_ledger_integrity() TO anon;
GRANT ALL ON FUNCTION public.fn_protect_ledger_integrity() TO authenticated;
GRANT ALL ON FUNCTION public.fn_protect_ledger_integrity() TO service_role;


--
-- Name: FUNCTION fn_update_caja_operativa_saldo(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_update_caja_operativa_saldo() TO anon;
GRANT ALL ON FUNCTION public.fn_update_caja_operativa_saldo() TO authenticated;
GRANT ALL ON FUNCTION public.fn_update_caja_operativa_saldo() TO service_role;


--
-- Name: FUNCTION fn_update_contratos_fondeo_timestamp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_update_contratos_fondeo_timestamp() TO anon;
GRANT ALL ON FUNCTION public.fn_update_contratos_fondeo_timestamp() TO authenticated;
GRANT ALL ON FUNCTION public.fn_update_contratos_fondeo_timestamp() TO service_role;


--
-- Name: FUNCTION fn_update_cuentas_financieras_saldo(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_update_cuentas_financieras_saldo() TO anon;
GRANT ALL ON FUNCTION public.fn_update_cuentas_financieras_saldo() TO authenticated;
GRANT ALL ON FUNCTION public.fn_update_cuentas_financieras_saldo() TO service_role;


--
-- Name: FUNCTION generar_reporte_cierre(p_fecha date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generar_reporte_cierre(p_fecha date) TO anon;
GRANT ALL ON FUNCTION public.generar_reporte_cierre(p_fecha date) TO authenticated;
GRANT ALL ON FUNCTION public.generar_reporte_cierre(p_fecha date) TO service_role;


--
-- Name: FUNCTION get_actividad_empleado(p_empleado_id uuid, p_limit integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_actividad_empleado(p_empleado_id uuid, p_limit integer) TO anon;
GRANT ALL ON FUNCTION public.get_actividad_empleado(p_empleado_id uuid, p_limit integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_actividad_empleado(p_empleado_id uuid, p_limit integer) TO service_role;


--
-- Name: FUNCTION get_auditoria_registro(p_tabla character varying, p_registro_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_auditoria_registro(p_tabla character varying, p_registro_id uuid) TO service_role;


--
-- Name: FUNCTION get_cartera_risk_summary(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_cartera_risk_summary() TO anon;
GRANT ALL ON FUNCTION public.get_cartera_risk_summary() TO authenticated;
GRANT ALL ON FUNCTION public.get_cartera_risk_summary() TO service_role;


--
-- Name: FUNCTION get_contratos_renovables(p_dias integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_contratos_renovables(p_dias integer) TO anon;
GRANT ALL ON FUNCTION public.get_contratos_renovables(p_dias integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_contratos_renovables(p_dias integer) TO service_role;


--
-- Name: FUNCTION get_contratos_vencimientos(p_dias integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_contratos_vencimientos(p_dias integer) TO anon;
GRANT ALL ON FUNCTION public.get_contratos_vencimientos(p_dias integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_contratos_vencimientos(p_dias integer) TO service_role;


--
-- Name: FUNCTION get_historial_notificaciones(p_credito_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_historial_notificaciones(p_credito_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_historial_notificaciones(p_credito_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_historial_notificaciones(p_credito_id uuid) TO service_role;


--
-- Name: FUNCTION get_movimientos_dia(p_fecha date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_movimientos_dia(p_fecha date) TO anon;
GRANT ALL ON FUNCTION public.get_movimientos_dia(p_fecha date) TO authenticated;
GRANT ALL ON FUNCTION public.get_movimientos_dia(p_fecha date) TO service_role;


--
-- Name: FUNCTION get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying, p_email character varying, p_direccion text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying, p_email character varying, p_direccion text) TO anon;
GRANT ALL ON FUNCTION public.get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying, p_email character varying, p_direccion text) TO authenticated;
GRANT ALL ON FUNCTION public.get_or_create_persona(p_tipo_documento character varying, p_numero_documento character varying, p_nombres character varying, p_apellido_paterno character varying, p_apellido_materno character varying, p_telefono character varying, p_email character varying, p_direccion text) TO service_role;


--
-- Name: FUNCTION get_saldo_caja_efectivo(p_caja_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_saldo_caja_efectivo(p_caja_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_saldo_caja_efectivo(p_caja_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_saldo_caja_efectivo(p_caja_id uuid) TO service_role;


--
-- Name: FUNCTION get_upcoming_expirations(p_days integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_upcoming_expirations(p_days integer) TO anon;
GRANT ALL ON FUNCTION public.get_upcoming_expirations(p_days integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_upcoming_expirations(p_days integer) TO service_role;


--
-- Name: FUNCTION get_user_role(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_user_role() TO anon;
GRANT ALL ON FUNCTION public.get_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.get_user_role() TO service_role;


--
-- Name: FUNCTION get_vencimientos_agrupados(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_vencimientos_agrupados() TO anon;
GRANT ALL ON FUNCTION public.get_vencimientos_agrupados() TO authenticated;
GRANT ALL ON FUNCTION public.get_vencimientos_agrupados() TO service_role;


--
-- Name: FUNCTION job_actualizar_estados_creditos(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.job_actualizar_estados_creditos() TO anon;
GRANT ALL ON FUNCTION public.job_actualizar_estados_creditos() TO authenticated;
GRANT ALL ON FUNCTION public.job_actualizar_estados_creditos() TO service_role;


--
-- Name: FUNCTION limpiar_codigos_expirados(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.limpiar_codigos_expirados() TO anon;
GRANT ALL ON FUNCTION public.limpiar_codigos_expirados() TO authenticated;
GRANT ALL ON FUNCTION public.limpiar_codigos_expirados() TO service_role;


--
-- Name: FUNCTION obtener_resumen_rendimientos(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.obtener_resumen_rendimientos() TO anon;
GRANT ALL ON FUNCTION public.obtener_resumen_rendimientos() TO authenticated;
GRANT ALL ON FUNCTION public.obtener_resumen_rendimientos() TO service_role;


--
-- Name: FUNCTION procesar_pago_trigger_fn(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.procesar_pago_trigger_fn() TO anon;
GRANT ALL ON FUNCTION public.procesar_pago_trigger_fn() TO authenticated;
GRANT ALL ON FUNCTION public.procesar_pago_trigger_fn() TO service_role;


--
-- Name: FUNCTION proyectar_interes(p_credito_id uuid, p_dias_adicionales integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) TO anon;
GRANT ALL ON FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) TO authenticated;
GRANT ALL ON FUNCTION public.proyectar_interes(p_credito_id uuid, p_dias_adicionales integer) TO service_role;


--
-- Name: FUNCTION puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.puede_anular_movimiento(p_movimiento_id uuid, p_usuario_id uuid) TO service_role;


--
-- Name: FUNCTION puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric) TO anon;
GRANT ALL ON FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric) TO authenticated;
GRANT ALL ON FUNCTION public.puede_enviar_notificacion(p_credito_id uuid, p_horas_minimas numeric) TO service_role;


--
-- Name: FUNCTION registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb, p_usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb, p_usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb, p_usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_evento(p_agregado_tipo character varying, p_agregado_id uuid, p_evento_tipo character varying, p_payload jsonb, p_usuario_id uuid) TO service_role;


--
-- Name: FUNCTION registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb) TO anon;
GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb) TO service_role;


--
-- Name: FUNCTION registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb, p_usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb, p_usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb, p_usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.registrar_pago_oficial(p_caja_id uuid, p_credito_id uuid, p_monto_pago numeric, p_tipo_operacion text, p_metodo_pago text, p_metadata jsonb, p_usuario_id uuid) TO service_role;


--
-- Name: FUNCTION reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid) TO anon;
GRANT ALL ON FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.reversar_movimiento(p_movimiento_id uuid, p_motivo text, p_usuario_id uuid) TO service_role;


--
-- Name: FUNCTION security_prevent_self_credit(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.security_prevent_self_credit() TO anon;
GRANT ALL ON FUNCTION public.security_prevent_self_credit() TO authenticated;
GRANT ALL ON FUNCTION public.security_prevent_self_credit() TO service_role;


--
-- Name: FUNCTION security_prevent_self_payment(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.security_prevent_self_payment() TO anon;
GRANT ALL ON FUNCTION public.security_prevent_self_payment() TO authenticated;
GRANT ALL ON FUNCTION public.security_prevent_self_payment() TO service_role;


--
-- Name: FUNCTION sync_caja_ids(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.sync_caja_ids() TO anon;
GRANT ALL ON FUNCTION public.sync_caja_ids() TO authenticated;
GRANT ALL ON FUNCTION public.sync_caja_ids() TO service_role;


--
-- Name: FUNCTION update_personas_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_personas_updated_at() TO anon;
GRANT ALL ON FUNCTION public.update_personas_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.update_personas_updated_at() TO service_role;


--
-- Name: FUNCTION update_saldo_credito_on_pago(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_saldo_credito_on_pago() TO anon;
GRANT ALL ON FUNCTION public.update_saldo_credito_on_pago() TO authenticated;
GRANT ALL ON FUNCTION public.update_saldo_credito_on_pago() TO service_role;


--
-- Name: FUNCTION validate_credito_update(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_credito_update() TO anon;
GRANT ALL ON FUNCTION public.validate_credito_update() TO authenticated;
GRANT ALL ON FUNCTION public.validate_credito_update() TO service_role;


--
-- Name: FUNCTION validate_pago_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_pago_insert() TO anon;
GRANT ALL ON FUNCTION public.validate_pago_insert() TO authenticated;
GRANT ALL ON FUNCTION public.validate_pago_insert() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE audit_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_log TO anon;
GRANT ALL ON TABLE public.audit_log TO authenticated;
GRANT ALL ON TABLE public.audit_log TO service_role;


--
-- Name: TABLE auditoria_transacciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.auditoria_transacciones TO anon;
GRANT ALL ON TABLE public.auditoria_transacciones TO authenticated;
GRANT ALL ON TABLE public.auditoria_transacciones TO service_role;


--
-- Name: TABLE cajas_operativas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cajas_operativas TO anon;
GRANT ALL ON TABLE public.cajas_operativas TO authenticated;
GRANT ALL ON TABLE public.cajas_operativas TO service_role;


--
-- Name: TABLE categorias_garantia; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.categorias_garantia TO anon;
GRANT ALL ON TABLE public.categorias_garantia TO authenticated;
GRANT ALL ON TABLE public.categorias_garantia TO service_role;


--
-- Name: TABLE clientes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clientes TO anon;
GRANT ALL ON TABLE public.clientes TO authenticated;
GRANT ALL ON TABLE public.clientes TO service_role;


--
-- Name: TABLE personas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.personas TO anon;
GRANT ALL ON TABLE public.personas TO authenticated;
GRANT ALL ON TABLE public.personas TO service_role;


--
-- Name: TABLE clientes_completo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.clientes_completo TO anon;
GRANT ALL ON TABLE public.clientes_completo TO authenticated;
GRANT ALL ON TABLE public.clientes_completo TO service_role;


--
-- Name: TABLE contratos_fondeo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contratos_fondeo TO anon;
GRANT ALL ON TABLE public.contratos_fondeo TO authenticated;
GRANT ALL ON TABLE public.contratos_fondeo TO service_role;


--
-- Name: TABLE creditos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.creditos TO anon;
GRANT ALL ON TABLE public.creditos TO authenticated;
GRANT ALL ON TABLE public.creditos TO service_role;


--
-- Name: TABLE cuentas_financieras; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cuentas_financieras TO anon;
GRANT ALL ON TABLE public.cuentas_financieras TO authenticated;
GRANT ALL ON TABLE public.cuentas_financieras TO service_role;


--
-- Name: TABLE departamentos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.departamentos TO anon;
GRANT ALL ON TABLE public.departamentos TO authenticated;
GRANT ALL ON TABLE public.departamentos TO service_role;


--
-- Name: TABLE distritos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.distritos TO anon;
GRANT ALL ON TABLE public.distritos TO authenticated;
GRANT ALL ON TABLE public.distritos TO service_role;


--
-- Name: TABLE empleados; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empleados TO anon;
GRANT ALL ON TABLE public.empleados TO authenticated;
GRANT ALL ON TABLE public.empleados TO service_role;


--
-- Name: TABLE empleados_completo; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empleados_completo TO anon;
GRANT ALL ON TABLE public.empleados_completo TO authenticated;
GRANT ALL ON TABLE public.empleados_completo TO service_role;


--
-- Name: TABLE empresas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.empresas TO anon;
GRANT ALL ON TABLE public.empresas TO authenticated;
GRANT ALL ON TABLE public.empresas TO service_role;


--
-- Name: TABLE eventos_sistema; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.eventos_sistema TO anon;
GRANT ALL ON TABLE public.eventos_sistema TO authenticated;
GRANT ALL ON TABLE public.eventos_sistema TO service_role;


--
-- Name: SEQUENCE eventos_sistema_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.eventos_sistema_id_seq TO anon;
GRANT ALL ON SEQUENCE public.eventos_sistema_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.eventos_sistema_id_seq TO service_role;


--
-- Name: TABLE garantias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.garantias TO anon;
GRANT ALL ON TABLE public.garantias TO authenticated;
GRANT ALL ON TABLE public.garantias TO service_role;


--
-- Name: TABLE inversionistas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inversionistas TO anon;
GRANT ALL ON TABLE public.inversionistas TO authenticated;
GRANT ALL ON TABLE public.inversionistas TO service_role;


--
-- Name: TABLE movimientos_caja_operativa; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.movimientos_caja_operativa TO anon;
GRANT ALL ON TABLE public.movimientos_caja_operativa TO authenticated;
GRANT ALL ON TABLE public.movimientos_caja_operativa TO service_role;


--
-- Name: TABLE movimientos_efectivos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.movimientos_efectivos TO anon;
GRANT ALL ON TABLE public.movimientos_efectivos TO authenticated;
GRANT ALL ON TABLE public.movimientos_efectivos TO service_role;


--
-- Name: TABLE notificaciones_enviadas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notificaciones_enviadas TO anon;
GRANT ALL ON TABLE public.notificaciones_enviadas TO authenticated;
GRANT ALL ON TABLE public.notificaciones_enviadas TO service_role;


--
-- Name: TABLE notificaciones_pendientes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notificaciones_pendientes TO anon;
GRANT ALL ON TABLE public.notificaciones_pendientes TO authenticated;
GRANT ALL ON TABLE public.notificaciones_pendientes TO service_role;


--
-- Name: TABLE pagos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pagos TO anon;
GRANT ALL ON TABLE public.pagos TO authenticated;
GRANT ALL ON TABLE public.pagos TO service_role;


--
-- Name: TABLE pagos_efectivos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pagos_efectivos TO anon;
GRANT ALL ON TABLE public.pagos_efectivos TO authenticated;
GRANT ALL ON TABLE public.pagos_efectivos TO service_role;


--
-- Name: TABLE provincias; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.provincias TO anon;
GRANT ALL ON TABLE public.provincias TO authenticated;
GRANT ALL ON TABLE public.provincias TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: TABLE sugerencias_catalogos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sugerencias_catalogos TO anon;
GRANT ALL ON TABLE public.sugerencias_catalogos TO authenticated;
GRANT ALL ON TABLE public.sugerencias_catalogos TO service_role;


--
-- Name: TABLE system_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_settings TO anon;
GRANT ALL ON TABLE public.system_settings TO authenticated;
GRANT ALL ON TABLE public.system_settings TO service_role;


--
-- Name: TABLE transacciones_capital; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.transacciones_capital TO anon;
GRANT ALL ON TABLE public.transacciones_capital TO authenticated;
GRANT ALL ON TABLE public.transacciones_capital TO service_role;


--
-- Name: TABLE usuarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.usuarios TO anon;
GRANT ALL ON TABLE public.usuarios TO authenticated;
GRANT ALL ON TABLE public.usuarios TO service_role;


--
-- Name: TABLE verificacion_whatsapp; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verificacion_whatsapp TO anon;
GRANT ALL ON TABLE public.verificacion_whatsapp TO authenticated;
GRANT ALL ON TABLE public.verificacion_whatsapp TO service_role;


--
-- Name: TABLE vista_creditos_intereses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vista_creditos_intereses TO anon;
GRANT ALL ON TABLE public.vista_creditos_intereses TO authenticated;
GRANT ALL ON TABLE public.vista_creditos_intereses TO service_role;


--
-- Name: TABLE vista_rendimientos_inversionistas; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.vista_rendimientos_inversionistas TO anon;
GRANT ALL ON TABLE public.vista_rendimientos_inversionistas TO authenticated;
GRANT ALL ON TABLE public.vista_rendimientos_inversionistas TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_12_16; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_12_16 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_12_16 TO dashboard_user;


--
-- Name: TABLE messages_2025_12_17; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_12_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_12_17 TO dashboard_user;


--
-- Name: TABLE messages_2025_12_18; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_12_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_12_18 TO dashboard_user;


--
-- Name: TABLE messages_2025_12_19; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_12_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_12_19 TO dashboard_user;


--
-- Name: TABLE messages_2025_12_20; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_12_20 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_12_20 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE iceberg_namespaces; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_namespaces TO service_role;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_namespaces TO anon;


--
-- Name: TABLE iceberg_tables; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.iceberg_tables TO service_role;
GRANT SELECT ON TABLE storage.iceberg_tables TO authenticated;
GRANT SELECT ON TABLE storage.iceberg_tables TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict vWPtQN2elITYAAvsKwHMNdDCjwNniezEcsSX17rpHUqNUwUEb5wAVkSs9wKgR1Y

