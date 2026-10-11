
-- ============ CORE TABLES (3NF) ============
CREATE TABLE public.membership_plans (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  duration_months int NOT NULL CHECK (duration_months > 0),
  fee numeric(10,2) NOT NULL CHECK (fee >= 0),
  max_equipment int NOT NULL DEFAULT 2 CHECK (max_equipment >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.members (
  id serial PRIMARY KEY,
  full_name text NOT NULL CHECK (length(trim(full_name)) BETWEEN 2 AND 100),
  email text NOT NULL UNIQUE CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text CHECK (phone ~ '^[0-9+\- ]{7,15}$'),
  date_of_birth date,
  gender text CHECK (gender IN ('M','F','O')),
  join_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.memberships (
  id serial PRIMARY KEY,
  member_id int NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id int NOT NULL REFERENCES public.membership_plans(id),
  start_date date NOT NULL DEFAULT current_date,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  CHECK (end_date > start_date)
);

CREATE TABLE public.sports (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  max_team_size int NOT NULL CHECK (max_team_size > 0)
);

CREATE TABLE public.coaches (
  id serial PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  sport_id int NOT NULL REFERENCES public.sports(id),
  experience_years int NOT NULL DEFAULT 0 CHECK (experience_years >= 0)
);

CREATE TABLE public.facilities (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  facility_type text NOT NULL,
  capacity int NOT NULL CHECK (capacity > 0),
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0)
);

CREATE TABLE public.teams (
  id serial PRIMARY KEY,
  name text NOT NULL,
  sport_id int NOT NULL REFERENCES public.sports(id),
  coach_id int REFERENCES public.coaches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, sport_id)
);

CREATE TABLE public.team_members (
  team_id int NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id int NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  jersey_no int CHECK (jersey_no BETWEEN 0 AND 99),
  is_captain boolean NOT NULL DEFAULT false,
  joined_on date NOT NULL DEFAULT current_date,
  PRIMARY KEY (team_id, member_id),
  UNIQUE (team_id, jersey_no)
);

CREATE TABLE public.training_sessions (
  id serial PRIMARY KEY,
  team_id int NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  coach_id int REFERENCES public.coaches(id),
  facility_id int NOT NULL REFERENCES public.facilities(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  focus text,
  CHECK (ends_at > starts_at)
);

CREATE TABLE public.facility_bookings (
  id serial PRIMARY KEY,
  facility_id int NOT NULL REFERENCES public.facilities(id),
  member_id int NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  attendees int NOT NULL DEFAULT 1 CHECK (attendees > 0),
  purpose text,
  CHECK (ends_at > starts_at)
);

CREATE TABLE public.tournaments (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  sport_id int NOT NULL REFERENCES public.sports(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  CHECK (end_date >= start_date)
);

CREATE TABLE public.tournament_participants (
  tournament_id int NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id int NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  registered_on date NOT NULL DEFAULT current_date,
  PRIMARY KEY (tournament_id, team_id)
);

CREATE TABLE public.fixtures (
  id serial PRIMARY KEY,
  tournament_id int NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  home_team_id int NOT NULL REFERENCES public.teams(id),
  away_team_id int NOT NULL REFERENCES public.teams(id),
  facility_id int NOT NULL REFERENCES public.facilities(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  CHECK (home_team_id <> away_team_id),
  CHECK (ends_at > starts_at)
);

CREATE TABLE public.results (
  fixture_id int PRIMARY KEY REFERENCES public.fixtures(id) ON DELETE CASCADE,
  home_score int NOT NULL CHECK (home_score BETWEEN 0 AND 500),
  away_score int NOT NULL CHECK (away_score BETWEEN 0 AND 500),
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.player_stats (
  fixture_id int NOT NULL REFERENCES public.fixtures(id) ON DELETE CASCADE,
  member_id int NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0 CHECK (points >= 0),
  PRIMARY KEY (fixture_id, member_id)
);

CREATE TABLE public.payments (
  id serial PRIMARY KEY,
  membership_id int NOT NULL REFERENCES public.memberships(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  paid_on date NOT NULL DEFAULT current_date,
  method text NOT NULL DEFAULT 'cash' CHECK (method IN ('cash','card','upi','bank')),
  reference text
);

CREATE TABLE public.equipment (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  total_qty int NOT NULL CHECK (total_qty >= 0),
  available_qty int NOT NULL CHECK (available_qty >= 0),
  CHECK (available_qty <= total_qty)
);

CREATE TABLE public.equipment_issues (
  id serial PRIMARY KEY,
  equipment_id int NOT NULL REFERENCES public.equipment(id),
  member_id int NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  qty int NOT NULL DEFAULT 1 CHECK (qty > 0),
  issued_on date NOT NULL DEFAULT current_date,
  due_on date NOT NULL,
  returned_on date,
  CHECK (due_on >= issued_on),
  CHECK (returned_on IS NULL OR returned_on >= issued_on)
);

-- ============ INDEXES ============
CREATE INDEX idx_members_name ON public.members (lower(full_name));
CREATE INDEX idx_memberships_member ON public.memberships (member_id, end_date);
CREATE INDEX idx_team_members_member ON public.team_members (member_id);
CREATE INDEX idx_training_facility_time ON public.training_sessions (facility_id, starts_at);
CREATE INDEX idx_training_team_time ON public.training_sessions (team_id, starts_at);
CREATE INDEX idx_bookings_facility_time ON public.facility_bookings (facility_id, starts_at);
CREATE INDEX idx_fixtures_facility_time ON public.fixtures (facility_id, starts_at);
CREATE INDEX idx_fixtures_tournament ON public.fixtures (tournament_id);
CREATE INDEX idx_payments_membership ON public.payments (membership_id);
CREATE INDEX idx_issues_open ON public.equipment_issues (member_id) WHERE returned_on IS NULL;

-- ============ BUSINESS RULE FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.has_active_membership(_member int, _on date DEFAULT current_date)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM memberships WHERE member_id = _member AND status = 'active'
                 AND _on BETWEEN start_date AND end_date);
$$;

CREATE OR REPLACE FUNCTION public.facility_conflict(_facility int, _s timestamptz, _e timestamptz,
  _tbl text, _id int) RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM training_sessions WHERE facility_id=_facility AND starts_at < _e AND ends_at > _s AND NOT (_tbl='training' AND id=_id))
      OR EXISTS (SELECT 1 FROM facility_bookings WHERE facility_id=_facility AND starts_at < _e AND ends_at > _s AND NOT (_tbl='booking' AND id=_id))
      OR EXISTS (SELECT 1 FROM fixtures WHERE facility_id=_facility AND status<>'cancelled' AND starts_at < _e AND ends_at > _s AND NOT (_tbl='fixture' AND id=_id));
$$;

CREATE OR REPLACE FUNCTION public.team_conflict(_team int, _s timestamptz, _e timestamptz,
  _tbl text, _id int) RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM training_sessions WHERE team_id=_team AND starts_at < _e AND ends_at > _s AND NOT (_tbl='training' AND id=_id))
      OR EXISTS (SELECT 1 FROM fixtures WHERE (home_team_id=_team OR away_team_id=_team) AND status<>'cancelled' AND starts_at < _e AND ends_at > _s AND NOT (_tbl='fixture' AND id=_id));
$$;

CREATE OR REPLACE FUNCTION public.trg_training_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE cap int; sz int;
BEGIN
  IF public.facility_conflict(NEW.facility_id, NEW.starts_at, NEW.ends_at, 'training', NEW.id) THEN
    RAISE EXCEPTION 'Facility is already booked for this time slot'; END IF;
  IF public.team_conflict(NEW.team_id, NEW.starts_at, NEW.ends_at, 'training', NEW.id) THEN
    RAISE EXCEPTION 'Team already has a session or fixture at this time'; END IF;
  SELECT capacity INTO cap FROM facilities WHERE id = NEW.facility_id;
  SELECT count(*) INTO sz FROM team_members WHERE team_id = NEW.team_id;
  IF sz > cap THEN RAISE EXCEPTION 'Team size (%) exceeds facility capacity (%)', sz, cap; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER training_check BEFORE INSERT OR UPDATE ON public.training_sessions
  FOR EACH ROW EXECUTE FUNCTION public.trg_training_check();

CREATE OR REPLACE FUNCTION public.trg_booking_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE cap int;
BEGIN
  IF NOT public.has_active_membership(NEW.member_id, NEW.starts_at::date) THEN
    RAISE EXCEPTION 'Member does not have an active membership'; END IF;
  SELECT capacity INTO cap FROM facilities WHERE id = NEW.facility_id;
  IF NEW.attendees > cap THEN RAISE EXCEPTION 'Attendees (%) exceed facility capacity (%)', NEW.attendees, cap; END IF;
  IF public.facility_conflict(NEW.facility_id, NEW.starts_at, NEW.ends_at, 'booking', NEW.id) THEN
    RAISE EXCEPTION 'Facility is already booked for this time slot'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER booking_check BEFORE INSERT OR UPDATE ON public.facility_bookings
  FOR EACH ROW EXECUTE FUNCTION public.trg_booking_check();

CREATE OR REPLACE FUNCTION public.trg_fixture_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tournament_participants WHERE tournament_id=NEW.tournament_id AND team_id=NEW.home_team_id)
     OR NOT EXISTS (SELECT 1 FROM tournament_participants WHERE tournament_id=NEW.tournament_id AND team_id=NEW.away_team_id) THEN
    RAISE EXCEPTION 'Both teams must be registered participants of the tournament'; END IF;
  IF NEW.status <> 'cancelled' THEN
    IF public.facility_conflict(NEW.facility_id, NEW.starts_at, NEW.ends_at, 'fixture', NEW.id) THEN
      RAISE EXCEPTION 'Facility is already booked for this time slot'; END IF;
    IF public.team_conflict(NEW.home_team_id, NEW.starts_at, NEW.ends_at, 'fixture', NEW.id)
       OR public.team_conflict(NEW.away_team_id, NEW.starts_at, NEW.ends_at, 'fixture', NEW.id) THEN
      RAISE EXCEPTION 'A team already has a session or fixture at this time'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER fixture_check BEFORE INSERT OR UPDATE ON public.fixtures
  FOR EACH ROW EXECUTE FUNCTION public.trg_fixture_check();

CREATE OR REPLACE FUNCTION public.trg_participant_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT sport_id FROM teams WHERE id=NEW.team_id) <> (SELECT sport_id FROM tournaments WHERE id=NEW.tournament_id) THEN
    RAISE EXCEPTION 'Team sport does not match tournament sport'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER participant_check BEFORE INSERT ON public.tournament_participants
  FOR EACH ROW EXECUTE FUNCTION public.trg_participant_check();

CREATE OR REPLACE FUNCTION public.trg_team_member_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE mx int; sz int;
BEGIN
  IF NOT public.has_active_membership(NEW.member_id) THEN
    RAISE EXCEPTION 'Member does not have an active membership'; END IF;
  SELECT s.max_team_size INTO mx FROM teams t JOIN sports s ON s.id=t.sport_id WHERE t.id=NEW.team_id;
  SELECT count(*) INTO sz FROM team_members WHERE team_id=NEW.team_id;
  IF sz >= mx THEN RAISE EXCEPTION 'Team is full (max % players)', mx; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER team_member_check BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.trg_team_member_check();

CREATE OR REPLACE FUNCTION public.trg_result_after() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE fixtures SET status='completed' WHERE id=NEW.fixture_id AND status<>'completed';
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.trg_result_before() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT status FROM fixtures WHERE id=NEW.fixture_id) = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot record a result for a cancelled fixture'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER result_before BEFORE INSERT OR UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.trg_result_before();
CREATE TRIGGER result_after AFTER INSERT ON public.results FOR EACH ROW EXECUTE FUNCTION public.trg_result_after();

-- Equipment issue: active membership, per-plan limit, stock (transactional)
CREATE OR REPLACE FUNCTION public.trg_issue_before() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE lim int; open_qty int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT public.has_active_membership(NEW.member_id) THEN
      RAISE EXCEPTION 'Member does not have an active membership'; END IF;
    SELECT p.max_equipment INTO lim FROM memberships m JOIN membership_plans p ON p.id=m.plan_id
      WHERE m.member_id=NEW.member_id AND m.status='active' AND current_date BETWEEN m.start_date AND m.end_date
      ORDER BY p.max_equipment DESC LIMIT 1;
    SELECT coalesce(sum(qty),0) INTO open_qty FROM equipment_issues WHERE member_id=NEW.member_id AND returned_on IS NULL;
    IF open_qty + NEW.qty > lim THEN
      RAISE EXCEPTION 'Equipment limit exceeded: member may hold % item(s), currently holds %', lim, open_qty; END IF;
    UPDATE equipment SET available_qty = available_qty - NEW.qty WHERE id=NEW.equipment_id AND available_qty >= NEW.qty;
    IF NOT FOUND THEN RAISE EXCEPTION 'Not enough stock available'; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.returned_on IS NULL AND NEW.returned_on IS NOT NULL THEN
      UPDATE equipment SET available_qty = available_qty + OLD.qty WHERE id=OLD.equipment_id;
    ELSIF OLD.returned_on IS NOT NULL AND NEW.returned_on IS NULL THEN
      RAISE EXCEPTION 'Returned items cannot be re-opened';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER issue_before BEFORE INSERT OR UPDATE ON public.equipment_issues
  FOR EACH ROW EXECUTE FUNCTION public.trg_issue_before();

-- Fee collection: no overpayment
CREATE OR REPLACE FUNCTION public.trg_payment_check() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE fee numeric; paid numeric;
BEGIN
  SELECT p.fee INTO fee FROM memberships m JOIN membership_plans p ON p.id=m.plan_id WHERE m.id=NEW.membership_id;
  SELECT coalesce(sum(amount),0) INTO paid FROM payments WHERE membership_id=NEW.membership_id;
  IF paid + NEW.amount > fee THEN RAISE EXCEPTION 'Payment exceeds amount due (due: %)', fee - paid; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER payment_check BEFORE INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION public.trg_payment_check();

-- ============ VIEWS (reports) ============
CREATE VIEW public.v_membership_status WITH (security_invoker=on) AS
SELECT m.id AS member_id, m.full_name, m.email, p.name AS plan, ms.id AS membership_id, ms.start_date, ms.end_date,
  CASE WHEN ms.id IS NULL THEN 'none'
       WHEN ms.status='active' AND current_date BETWEEN ms.start_date AND ms.end_date THEN 'active'
       WHEN ms.status='cancelled' THEN 'cancelled' ELSE 'expired' END AS effective_status,
  (ms.end_date - current_date) AS days_left
FROM members m
LEFT JOIN LATERAL (SELECT * FROM memberships x WHERE x.member_id=m.id ORDER BY x.end_date DESC LIMIT 1) ms ON true
LEFT JOIN membership_plans p ON p.id=ms.plan_id;

CREATE VIEW public.v_fee_dues WITH (security_invoker=on) AS
SELECT ms.id AS membership_id, m.id AS member_id, m.full_name, p.name AS plan, p.fee,
  coalesce(sum(pay.amount),0) AS paid, p.fee - coalesce(sum(pay.amount),0) AS due, ms.start_date, ms.end_date
FROM memberships ms JOIN members m ON m.id=ms.member_id JOIN membership_plans p ON p.id=ms.plan_id
LEFT JOIN payments pay ON pay.membership_id=ms.id
GROUP BY ms.id, m.id, m.full_name, p.name, p.fee;

CREATE VIEW public.v_standings WITH (security_invoker=on) AS
WITH g AS (
  SELECT f.tournament_id, f.home_team_id AS team_id, r.home_score AS gf, r.away_score AS ga FROM fixtures f JOIN results r ON r.fixture_id=f.id
  UNION ALL
  SELECT f.tournament_id, f.away_team_id, r.away_score, r.home_score FROM fixtures f JOIN results r ON r.fixture_id=f.id
)
SELECT tp.tournament_id, tr.name AS tournament, tp.team_id, t.name AS team,
  count(g.team_id) AS played,
  count(*) FILTER (WHERE g.gf > g.ga) AS won,
  count(*) FILTER (WHERE g.gf = g.ga) AS drawn,
  count(*) FILTER (WHERE g.gf < g.ga) AS lost,
  coalesce(sum(g.gf),0) AS scored, coalesce(sum(g.ga),0) AS conceded,
  coalesce(sum(g.gf),0) - coalesce(sum(g.ga),0) AS diff,
  3*count(*) FILTER (WHERE g.gf > g.ga) + count(*) FILTER (WHERE g.gf = g.ga) AS points
FROM tournament_participants tp JOIN teams t ON t.id=tp.team_id JOIN tournaments tr ON tr.id=tp.tournament_id
LEFT JOIN g ON g.tournament_id=tp.tournament_id AND g.team_id=tp.team_id
GROUP BY tp.tournament_id, tr.name, tp.team_id, t.name;

CREATE VIEW public.v_facility_usage WITH (security_invoker=on) AS
WITH u AS (
  SELECT facility_id, 'training' AS kind, extract(epoch FROM ends_at-starts_at)/3600 AS hrs FROM training_sessions
  UNION ALL SELECT facility_id, 'booking', extract(epoch FROM ends_at-starts_at)/3600 FROM facility_bookings
  UNION ALL SELECT facility_id, 'fixture', extract(epoch FROM ends_at-starts_at)/3600 FROM fixtures WHERE status<>'cancelled'
)
SELECT f.id AS facility_id, f.name, f.facility_type, f.capacity,
  count(u.kind) AS total_slots,
  count(*) FILTER (WHERE u.kind='training') AS training_slots,
  count(*) FILTER (WHERE u.kind='booking') AS booking_slots,
  count(*) FILTER (WHERE u.kind='fixture') AS fixture_slots,
  round(coalesce(sum(u.hrs),0)::numeric,1) AS hours_used
FROM facilities f LEFT JOIN u ON u.facility_id=f.id
GROUP BY f.id;

CREATE VIEW public.v_player_performance WITH (security_invoker=on) AS
SELECT m.id AS member_id, m.full_name, count(ps.fixture_id) AS matches, coalesce(sum(ps.points),0) AS total_points,
  round(coalesce(avg(ps.points),0)::numeric,2) AS avg_points, coalesce(max(ps.points),0) AS best
FROM members m JOIN player_stats ps ON ps.member_id=m.id
GROUP BY m.id, m.full_name;

CREATE VIEW public.v_equipment_status WITH (security_invoker=on) AS
SELECT e.id AS equipment_id, e.name, e.category, e.total_qty, e.available_qty,
  e.total_qty - e.available_qty AS issued_qty,
  (SELECT count(*) FROM equipment_issues i WHERE i.equipment_id=e.id AND i.returned_on IS NULL AND i.due_on < current_date) AS overdue_issues
FROM equipment e;

-- ============ GRANTS + RLS (staff = any signed-in user) ============
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['membership_plans','members','memberships','sports','coaches','facilities','teams','team_members',
    'training_sessions','facility_bookings','tournaments','tournament_participants','fixtures','results','player_stats',
    'payments','equipment','equipment_issues'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Staff full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON public.v_membership_status, public.v_fee_dues, public.v_standings, public.v_facility_usage,
  public.v_player_performance, public.v_equipment_status TO authenticated, service_role;

-- ============ SAMPLE DATA ============
INSERT INTO public.membership_plans (name, duration_months, fee, max_equipment) VALUES
 ('Monthly Basic',1,1500,1),('Quarterly Standard',3,4000,2),('Annual Premium',12,14000,4),('Student Annual',12,8000,2);

INSERT INTO public.members (full_name,email,phone,date_of_birth,gender,join_date) VALUES
 ('Aarav Sharma','aarav.sharma@mail.com','9876543210','2001-04-12','M',current_date-200),
 ('Diya Patel','diya.patel@mail.com','9876500011','2003-08-22','F',current_date-180),
 ('Rohan Mehta','rohan.mehta@mail.com','9811122233','1998-01-05','M',current_date-320),
 ('Ananya Iyer','ananya.iyer@mail.com','9822233344','2002-11-30','F',current_date-90),
 ('Kabir Singh','kabir.singh@mail.com','9833344455','1999-06-18','M',current_date-60),
 ('Ishita Rao','ishita.rao@mail.com','9844455566','2004-02-14','F',current_date-150),
 ('Vihaan Gupta','vihaan.gupta@mail.com','9855566677','2000-09-09','M',current_date-400),
 ('Meera Nair','meera.nair@mail.com','9866677788','2001-12-01','F',current_date-45),
 ('Arjun Reddy','arjun.reddy@mail.com','9877788899','1997-03-27','M',current_date-250),
 ('Saanvi Joshi','saanvi.joshi@mail.com','9888899900','2003-05-16','F',current_date-30),
 ('Aditya Kumar','aditya.kumar@mail.com','9899900011','2002-07-07','M',current_date-120),
 ('Nisha Verma','nisha.verma@mail.com','9800011122','1996-10-10','F',current_date-500),
 ('Yash Malhotra','yash.malhotra@mail.com','9812312312','2001-01-21','M',current_date-75),
 ('Priya Desai','priya.desai@mail.com','9823423423','2000-04-04','F',current_date-210),
 ('Karan Chopra','karan.chopra@mail.com','9834534534','1999-08-08','M',current_date-15),
 ('Tara Menon','tara.menon@mail.com','9845645645','2004-06-06','F',current_date-400);

INSERT INTO public.memberships (member_id,plan_id,start_date,end_date,status) VALUES
 (1,3,current_date-200,current_date+165,'active'),(2,4,current_date-180,current_date+185,'active'),
 (3,3,current_date-320,current_date+45,'active'),(4,2,current_date-30,current_date+60,'active'),
 (5,1,current_date-10,current_date+20,'active'),(6,4,current_date-150,current_date+215,'active'),
 (7,3,current_date-100,current_date+265,'active'),(8,2,current_date-45,current_date+45,'active'),
 (9,3,current_date-250,current_date+115,'active'),(10,1,current_date-5,current_date+25,'active'),
 (11,2,current_date-60,current_date+30,'active'),(12,1,current_date-120,current_date-90,'expired'),
 (13,2,current_date-20,current_date+70,'active'),(14,3,current_date-210,current_date+155,'active'),
 (15,1,current_date-15,current_date+15,'active'),(16,3,current_date-400,current_date-35,'expired');

INSERT INTO public.payments (membership_id,amount,paid_on,method,reference) VALUES
 (1,14000,current_date-200,'upi','UPI-1001'),(2,4000,current_date-180,'card','CRD-2201'),(2,2000,current_date-90,'card','CRD-2202'),
 (3,14000,current_date-320,'bank','NEFT-881'),(4,4000,current_date-30,'upi','UPI-1002'),(5,1500,current_date-10,'cash',NULL),
 (6,8000,current_date-150,'upi','UPI-1003'),(7,7000,current_date-100,'card','CRD-2203'),(8,2500,current_date-45,'cash',NULL),
 (9,14000,current_date-250,'bank','NEFT-882'),(11,4000,current_date-60,'upi','UPI-1004'),(12,1500,current_date-120,'cash',NULL),
 (13,1000,current_date-20,'upi','UPI-1005'),(14,10000,current_date-210,'card','CRD-2204'),(16,14000,current_date-400,'bank','NEFT-883');

INSERT INTO public.sports (name,max_team_size) VALUES ('Football',18),('Basketball',12),('Cricket',15),('Badminton',4);

INSERT INTO public.coaches (full_name,email,phone,sport_id,experience_years) VALUES
 ('Sunil Thapa','sunil.thapa@club.com','9700000001',1,12),('Rina D''Souza','rina.dsouza@club.com','9700000002',2,8),
 ('Vikram Bhatt','vikram.bhatt@club.com','9700000003',3,15),('Pooja Kulkarni','pooja.k@club.com','9700000004',4,6);

INSERT INTO public.facilities (name,facility_type,capacity,hourly_rate) VALUES
 ('Main Turf Ground','Football Pitch',30,2500),('Indoor Court A','Basketball Court',20,1200),
 ('Indoor Court B','Basketball Court',20,1200),('Cricket Oval','Cricket Ground',40,3000),('Shuttle Hall','Badminton Hall',12,600);

INSERT INTO public.teams (name,sport_id,coach_id) VALUES
 ('Thunder FC',1,1),('Strikers United',1,1),('Hoop Hawks',2,2),('Court Kings',2,2),('Rim Rockets',2,2),('Willow Warriors',3,3);

INSERT INTO public.team_members (team_id,member_id,jersey_no,is_captain) VALUES
 (1,1,10,true),(1,3,7,false),(1,5,9,false),(2,7,10,true),(2,9,4,false),(2,13,11,false),
 (3,2,23,true),(3,4,11,false),(3,6,5,false),(4,8,8,true),(4,10,3,false),(4,11,24,false),
 (5,14,1,true),(5,15,2,false),(6,3,18,true),(6,7,45,false),(6,9,1,false);

INSERT INTO public.tournaments (name,sport_id,start_date,end_date,status) VALUES
 ('Monsoon Football Cup',1,current_date-20,current_date+10,'ongoing'),
 ('City Hoops League',2,current_date-30,current_date+20,'ongoing'),
 ('Winter Cricket Bash',3,current_date+30,current_date+45,'upcoming');

INSERT INTO public.tournament_participants (tournament_id,team_id) VALUES (1,1),(1,2),(2,3),(2,4),(2,5),(3,6);

INSERT INTO public.fixtures (tournament_id,home_team_id,away_team_id,facility_id,starts_at,ends_at,status) VALUES
 (1,1,2,1,date_trunc('day',now())-interval '14 days'+interval '17 hours',date_trunc('day',now())-interval '14 days'+interval '19 hours','scheduled'),
 (1,2,1,1,date_trunc('day',now())-interval '5 days'+interval '17 hours',date_trunc('day',now())-interval '5 days'+interval '19 hours','scheduled'),
 (2,3,4,2,date_trunc('day',now())-interval '20 days'+interval '18 hours',date_trunc('day',now())-interval '20 days'+interval '20 hours','scheduled'),
 (2,4,5,2,date_trunc('day',now())-interval '12 days'+interval '18 hours',date_trunc('day',now())-interval '12 days'+interval '20 hours','scheduled'),
 (2,5,3,3,date_trunc('day',now())-interval '4 days'+interval '18 hours',date_trunc('day',now())-interval '4 days'+interval '20 hours','scheduled'),
 (1,1,2,1,date_trunc('day',now())+interval '4 days'+interval '17 hours',date_trunc('day',now())+interval '4 days'+interval '19 hours','scheduled'),
 (2,3,5,2,date_trunc('day',now())+interval '6 days'+interval '18 hours',date_trunc('day',now())+interval '6 days'+interval '20 hours','scheduled');

INSERT INTO public.results (fixture_id,home_score,away_score) VALUES (1,2,1),(2,1,1),(3,78,71),(4,65,69),(5,80,84);

INSERT INTO public.player_stats (fixture_id,member_id,points) VALUES
 (1,1,1),(1,5,1),(1,7,1),(2,9,1),(2,3,1),
 (3,2,24),(3,4,18),(3,6,12),(3,8,22),(3,10,15),(3,11,20),
 (4,8,19),(4,11,25),(4,14,28),(4,15,21),
 (5,14,30),(5,15,26),(5,2,27),(5,4,22),(5,6,19);

INSERT INTO public.training_sessions (team_id,coach_id,facility_id,starts_at,ends_at,focus) VALUES
 (1,1,1,date_trunc('day',now())+interval '1 day'+interval '6 hours',date_trunc('day',now())+interval '1 day'+interval '8 hours','Pressing drills'),
 (2,1,1,date_trunc('day',now())+interval '2 days'+interval '6 hours',date_trunc('day',now())+interval '2 days'+interval '8 hours','Set pieces'),
 (3,2,2,date_trunc('day',now())+interval '1 day'+interval '16 hours',date_trunc('day',now())+interval '1 day'+interval '18 hours','Zone defence'),
 (4,2,3,date_trunc('day',now())+interval '1 day'+interval '16 hours',date_trunc('day',now())+interval '1 day'+interval '18 hours','Shooting'),
 (6,3,4,date_trunc('day',now())+interval '3 days'+interval '7 hours',date_trunc('day',now())+interval '3 days'+interval '10 hours','Net session');

INSERT INTO public.facility_bookings (facility_id,member_id,starts_at,ends_at,attendees,purpose) VALUES
 (5,2,date_trunc('day',now())+interval '1 day'+interval '9 hours',date_trunc('day',now())+interval '1 day'+interval '10 hours',4,'Doubles practice'),
 (5,6,date_trunc('day',now())+interval '1 day'+interval '10 hours',date_trunc('day',now())+interval '1 day'+interval '11 hours',2,'Singles'),
 (2,10,date_trunc('day',now())+interval '2 days'+interval '12 hours',date_trunc('day',now())+interval '2 days'+interval '13 hours',8,'Pickup game');

INSERT INTO public.equipment (name,category,total_qty,available_qty) VALUES
 ('Football (Size 5)','Football',20,20),('Basketball (Size 7)','Basketball',15,15),('Cricket Bat','Cricket',10,10),
 ('Badminton Racquet','Badminton',12,12),('Shuttlecock Tube','Badminton',30,30),('Training Cones Set','General',8,8);

INSERT INTO public.equipment_issues (equipment_id,member_id,qty,issued_on,due_on) VALUES
 (1,1,1,current_date-3,current_date+4),(2,2,1,current_date-10,current_date-3),(4,6,2,current_date-1,current_date+6),
 (3,9,1,current_date-2,current_date+5),(5,4,1,current_date-8,current_date-1);
UPDATE public.equipment_issues SET returned_on = current_date WHERE id = 4;
