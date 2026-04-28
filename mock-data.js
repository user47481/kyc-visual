// Mock KYC заявки

const FIRST_NAMES_M = ["Filipp","Aleksei","Maxim","Daniil","Roman","Yaroslav","Oleksandr","Mikhail","Pavlo","Andrii","Viktor","Stanislav","Bohdan","Dmytro","Sergii","Ivan","Nikita","Volodymyr"];
const FIRST_NAMES_F = ["Olena","Sofiia","Anastasiia","Yulia","Kateryna","Mariia","Iryna","Tetiana","Daria","Polina","Veronika","Khrystyna","Nataliia","Liudmyla"];
const LAST_NAMES = ["Gromak","Shevchenko","Bondarenko","Kovalenko","Tkachenko","Melnyk","Polishchuk","Marchenko","Boyko","Kravchenko","Pavlenko","Lysenko","Petrenko","Savchenko","Romanyuk","Ostapchuk","Hryhorenko","Voloshyn","Klymenko","Demchenko"];
const COUNTRIES = [
  { name: "Ukraine",        code: "+380", flag: "🇺🇦" },
  { name: "Poland",         code: "+48",  flag: "🇵🇱" },
  { name: "Germany",        code: "+49",  flag: "🇩🇪" },
  { name: "Lithuania",      code: "+370", flag: "🇱🇹" },
  { name: "Latvia",         code: "+371", flag: "🇱🇻" },
  { name: "Estonia",        code: "+372", flag: "🇪🇪" },
  { name: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { name: "United Kingdom", code: "+44",  flag: "🇬🇧" },
  { name: "Spain",          code: "+34",  flag: "🇪🇸" },
  { name: "Portugal",       code: "+351", flag: "🇵🇹" },
  { name: "Netherlands",    code: "+31",  flag: "🇳🇱" },
  { name: "Italy",          code: "+39",  flag: "🇮🇹" },
  { name: "France",         code: "+33",  flag: "🇫🇷" },
  { name: "Romania",        code: "+40",  flag: "🇷🇴" },
  { name: "Bulgaria",       code: "+359", flag: "🇧🇬" },
  { name: "Afghanistan",    code: "+93",  flag: "🇦🇫" },
];
const CITIES = ["Kyiv","Lviv","Vyshgorod","Odesa","Kharkiv","Warsaw","Krakow","Berlin","Munich","Vilnius","Riga","Tallinn","Prague","Brno","London","Madrid","Lisbon","Amsterdam","Rome","Bucharest","Sofia"];
const STREETS = ["Sholudenko","Khreschatyk","Saksahanskoho","Velyka Vasylkivska","Prospekt Peremohy","Antonovycha","Yaroslaviv Val","Hrushevskoho","Stryiska","Horodotska"];
const PROFESSIONS = ["Software Engineer","Product Manager","Designer","Lawyer","Accountant","Doctor","Architect","Marketing Manager","Sales Director","CEO","Civil Engineer","Teacher","Financial Analyst","Data Scientist","Trader","Consultant"];
const CAPITAL_SOURCES = ["Employment income","Business activity","Savings","Investment income","Inheritance","Sale of property","Other"];

// status: STAGE_1_IDENTITY=0, STAGE_2_PERSONAL=1, STAGE_3_ADDRESS=2, STAGE_4_GENERAL=3,
// SENT_TO_IRM=9, DENIED_ONDATO=-2, DENIED_IRM=-1, DISCONTINUED=-6, APPROVED=10
const STATUS_DISTRIBUTION = [
  10, 10, 10, 10, 10, 10, 10, 10,    // approved (заявок много)
  9, 9, 9, 9,                        // sent to IRM
  3, 3, 3,                           // stage 4
  2, 2,                              // stage 3
  1, 1,                              // stage 2
  0, 0,                              // stage 1
  -1, -1,                            // denied IRM
  -2, -2,                            // denied ondato
  -6,                                // discontinued
];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function makeKycRow(seed) {
  const r = seededRandom(seed * 1000 + 7);
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const isFemale = r() < 0.45;
  const firstname = pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M);
  const lastname = pick(LAST_NAMES);
  const country = pick(COUNTRIES);
  const addressCountry = r() < 0.7 ? country : pick(COUNTRIES);
  const status = STATUS_DISTRIBUTION[Math.floor(r() * STATUS_DISTRIBUTION.length)];
  const validator_type = r() < 0.55 ? "ondato" : "manual";
  const isCompany = r() < 0.18;
  const isPolitical = r() < 0.07;

  // dates
  const now = new Date("2026-04-28T12:00:00Z").getTime();
  const ageDays = Math.floor(r() * 90);
  const created = new Date(now - ageDays * 86400000 - Math.floor(r() * 86400000));
  const updated = new Date(created.getTime() + Math.floor(r() * Math.min(ageDays + 1, 30)) * 86400000 + Math.floor(r() * 3600 * 1000 * 12));

  const investorId = 100000 + Math.floor(r() * 899999);
  const govIdLen = 7 + Math.floor(r() * 4);
  let govId = "";
  for (let i = 0; i < govIdLen; i++) govId += Math.floor(r() * 10);

  const birthYear = 1960 + Math.floor(r() * 45);
  const birthMonth = String(1 + Math.floor(r() * 12)).padStart(2, "0");
  const birthDay = String(1 + Math.floor(r() * 28)).padStart(2, "0");

  const data = {
    firstname,
    lastname,
    birthdate: `${birthYear}-${birthMonth}-${birthDay}`,
    gov_id: govId,
    state: `${country.flag} ${country.name} (${country.code})`,
    gender: isFemale ? "female" : "male",
    address_city: pick(CITIES),
    address_country: `${addressCountry.flag} ${addressCountry.name} (${addressCountry.code})`,
    address_postcode: String(Math.floor(r() * 90000) + 10000),
    address_street: pick(STREETS) + " " + (1 + Math.floor(r() * 200)) + (r() < 0.3 ? "A" : ""),
    address_build: String(1 + Math.floor(r() * 50)),
    address_apartment: String(1 + Math.floor(r() * 200)),
    isCompany,
    company_isyour: isCompany && r() < 0.6,
    company_title: isCompany ? rand(["Acme Holdings LLC","Northwind Trading","Globex Corp","Initech","Soylent Industries","Stark Innovations"]) : "",
    company_number: isCompany ? "UA" + Math.floor(r() * 90000000 + 10000000) : "",
    company_state: isCompany ? `${country.flag} ${country.name} (${country.code})` : "",
    company_owner: isCompany ? `${firstname} ${lastname}` : "",
    isPolitical,
    profession: pick(PROFESSIONS),
    capitalsource: pick(CAPITAL_SOURCES),
  };

  return {
    id: `${(seed * 1234567).toString(16).padStart(8,'0').slice(0,8)}-${(seed * 89).toString(16).padStart(4,'0').slice(0,4)}-4${(seed * 13).toString(16).padStart(3,'0').slice(0,3)}-a${(seed * 41).toString(16).padStart(3,'0').slice(0,3)}-${(seed * 9173).toString(16).padStart(12,'0').slice(0,12)}`,
    created_at: created.toISOString(),
    updated_at: updated.toISOString(),
    investor_id: investorId,
    status,
    data,
    validator_type,
  };
}

function makeMockData(count) {
  const rows = [];
  for (let i = 1; i <= count; i++) rows.push(makeKycRow(i));
  return rows;
}

window.makeMockData = makeMockData;

// Status meta
window.KYC_STATUSES = {
  "-6": { label: "Discontinued", type: "gray" },
  "-2": { label: "Denied (Ondato)", type: "red" },
  "-1": { label: "Denied (IRM)", type: "red" },
  "0":  { label: "Stage 1 · Identity", type: "blue" },
  "1":  { label: "Stage 2 · Personal", type: "blue" },
  "2":  { label: "Stage 3 · Address", type: "blue" },
  "3":  { label: "Stage 4 · General", type: "blue" },
  "9":  { label: "Sent to IRM", type: "purple" },
  "10": { label: "Approved", type: "green" },
};
