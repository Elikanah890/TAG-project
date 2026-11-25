import { useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import tzLocations from '@/data/tz-locations.json';

type TzLocations = Record<string, Record<string, string[]>>;
const TZ = tzLocations as TzLocations;
const TZ_REGIONS = Object.keys(TZ).sort((a, b) => a.localeCompare(b));
const OTHER_VALUE = '__other__';

type FormData = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  whatsappNumber: string;
  whatsappSameAsPhone: boolean;
  email: string;
  maritalStatus: string;
  originRegion: string;
  originDistrict: string;
  currentRegion: string;
  currentDistrict: string;
  currentWard: string;
  currentStreet: string;
  employmentStatus: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  currentPosition: string;
  ushemasi: string;
  timeInChurch: string;
  expectedStayDuration: string;
  baptismStatus: string;
  desiredDepartment: string;
};

const initialForm: FormData = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  phone: '',
  whatsappNumber: '',
  whatsappSameAsPhone: true,
  email: '',
  maritalStatus: '',
  originRegion: '',
  originDistrict: '',
  currentRegion: '',
  currentDistrict: '',
  currentWard: '',
  currentStreet: '',
  employmentStatus: '',
  occupation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  currentPosition: '',
  ushemasi: '',
  timeInChurch: '',
  expectedStayDuration: '',
  baptismStatus: '',
  desiredDepartment: '',
};

const steps = [
  { id: 1, title: 'Taarifa Binafsi', short: 'Personal' },
  { id: 2, title: 'Mahali', short: 'Location' },
  { id: 3, title: 'Kazi & Dharura', short: 'Employment' },
  { id: 4, title: 'Kanisa', short: 'Church' },
  { id: 5, title: 'Thibitisha', short: 'Confirm' },
];

const fieldClass =
  'h-11 rounded-xl border-gray-200 bg-gray-50/80 shadow-none transition-colors focus-visible:ring-[#7A1F2B]/20 focus-visible:border-[#7A1F2B]';
const selectTriggerClass =
  'h-11 rounded-xl border-gray-200 bg-gray-50/80 shadow-none focus:ring-[#7A1F2B]/20 focus:border-[#7A1F2B]';

function Field({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-[#7A1F2B]">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 break-words">{value?.trim() || '—'}</p>
    </div>
  );
}

function LocationSelect({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  const inOptions = value !== '' && options.includes(value);
  const [manualMode, setManualMode] = useState(() => value !== '' && !options.includes(value));
  const isOther = manualMode || (value !== '' && !inOptions);
  const selectValue = isOther ? OTHER_VALUE : value;

  return (
    <Field label={label} required={required}>
      <div className="space-y-2">
        <Select
          value={selectValue}
          disabled={disabled}
          onValueChange={(v) => {
            if (v === OTHER_VALUE) {
              setManualMode(true);
              onChange('');
            } else {
              setManualMode(false);
              onChange(v);
            }
          }}
        >
          <SelectTrigger className={selectTriggerClass}><SelectValue placeholder={placeholder} /></SelectTrigger>
          <SelectContent>
            {options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            <SelectItem value={OTHER_VALUE}>Other / Andika mwenyewe</SelectItem>
          </SelectContent>
        </Select>
        {isOther ? (
          <Input
            className={fieldClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Andika hapa / Write here"
          />
        ) : null}
      </div>
    </Field>
  );
}

export default function Register() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((p) => {
      const next = { ...p, [k]: v } as FormData;
      if (k === 'phone' && next.whatsappSameAsPhone) next.whatsappNumber = String(v);
      if (k === 'whatsappSameAsPhone') next.whatsappNumber = v ? next.phone : next.whatsappNumber;
      return next;
    });

  const originDistrictOptions = useMemo(() => {
    const d = TZ[form.originRegion];
    return d ? Object.keys(d).sort((a, b) => a.localeCompare(b)) : [];
  }, [form.originRegion]);
  const currentDistrictOptions = useMemo(() => {
    const d = TZ[form.currentRegion];
    return d ? Object.keys(d).sort((a, b) => a.localeCompare(b)) : [];
  }, [form.currentRegion]);
  const currentWardOptions = useMemo(() => {
    const wards = TZ[form.currentRegion]?.[form.currentDistrict];
    return Array.isArray(wards) ? wards : [];
  }, [form.currentRegion, form.currentDistrict]);

  const setOriginRegion = (v: string) => setForm((p) => ({ ...p, originRegion: v, originDistrict: '' }));
  const setOriginDistrict = (v: string) => set('originDistrict', v);
  const setCurrentRegion = (v: string) => setForm((p) => ({ ...p, currentRegion: v, currentDistrict: '', currentWard: '' }));
  const setCurrentDistrict = (v: string) => setForm((p) => ({ ...p, currentDistrict: v, currentWard: '' }));
  const setCurrentWard = (v: string) => set('currentWard', v);

  const validateStep = (s = step) => {
    if (s === 0) {
      if (!form.fullName.trim()) return 'Jina kamili linahitajika / Full name is required';
      if (!form.dateOfBirth) return 'Tarehe ya kuzaliwa inahitajika / Date of birth is required';
      if (!form.phone.trim()) return 'Namba ya simu inahitajika / Phone is required';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    const err = validateStep(0);
    if (err) {
      toast.error(err);
      setStep(0);
      return;
    }
    if (!confirmed) {
      toast.error('Tafadhali thibitisha taarifa zako kabla ya kutuma / Please confirm before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(form)
          .filter(([k]) => k !== 'whatsappSameAsPhone')
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
          .filter(([, v]) => v !== '' && v != null),
      );
      await api.post('/members/register', payload);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <section className="bg-[#FAF6F0] px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <Card className="overflow-hidden rounded-3xl border-gray-100 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
              <CardContent className="px-6 py-14 text-center sm:px-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9962B]">Ombi Limepokelewa</p>
                <h1 className="mt-3 font-serif text-3xl text-[#7A1F2B] sm:text-4xl">Application Submitted</h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600">
                  Asante kwa kujiunga na TAG Forest ya Kwanza. Tafadhali subiri Katibu wa Kanisa kupitia ombi lako.
                  Utawasilishwa pindi maombi yatakapopitiwa.
                </p>
                <div className="mt-8 rounded-2xl border border-[#C9962B]/20 bg-[#C9962B]/5 p-4 text-sm text-[#7A5A10]">
                  Please wait for the Secretary to review your membership application. You will be contacted once it is processed.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-[#FAF6F0] px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9962B]">TAG Forest ya Kwanza</p>
            <h1 className="mt-2 font-serif text-3xl text-[#7A1F2B] sm:text-4xl lg:text-5xl">Member Registration</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 sm:text-base">
              Jaza fomu hii kuomba uanachama. Taarifa zako zitahifadhiwa kwa usiri na kupitia Katibu wa Kanisa.
            </p>
          </div>

          <Card className="overflow-hidden rounded-3xl border-gray-100 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)]">
            <CardHeader className="border-b border-gray-100 bg-white px-5 pb-6 pt-6 sm:px-8 sm:pt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Hatua {step + 1} ya {steps.length}: {steps[step].title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-gray-500">
                    {step === 4 ? 'Kagua taarifa zako kabla ya kutuma.' : 'Jaza taarifa kwa usahihi.'}
                  </CardDescription>
                </div>
                <div className="hidden rounded-full bg-[#7A1F2B]/5 px-3 py-1 text-xs font-semibold text-[#7A1F2B] sm:block">
                  {Math.round(((step + 1) / steps.length) * 100)}%
                </div>
              </div>

              <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
                {steps.map((s, i) => {
                  const active = i === step;
                  const done = i < step;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className="relative flex w-full items-center justify-center">
                        {i > 0 && (
                          <div
                            className={cn(
                              'absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2',
                              i <= step ? 'bg-[#C9962B]' : 'bg-gray-200',
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                            done && 'border-[#C9962B] bg-[#C9962B] text-white',
                            active && 'border-[#7A1F2B] bg-[#7A1F2B] text-white shadow-lg shadow-[#7A1F2B]/20',
                            !done && !active && 'border-gray-200 bg-white text-gray-400',
                          )}
                        >
                          {done ? <Check className="h-4 w-4" /> : s.id}
                        </div>
                      </div>
                      <span className={cn('text-center text-[11px] leading-tight sm:text-xs', active ? 'font-semibold text-[#7A1F2B]' : done ? 'text-[#A9771F]' : 'text-gray-400')}>
                        <span className="hidden sm:inline">{s.title}</span>
                        <span className="sm:hidden">{s.short}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
              {step === 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Jina Kamili / Full Name" required className="sm:col-span-2">
                    <Input className={fieldClass} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Mf. Juma Ramadhani" />
                  </Field>
                  <Field label="Jinsia / Gender">
                    <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua jinsia" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mume">Mume / Male</SelectItem>
                        <SelectItem value="Mke">Mke / Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Tarehe ya Kuzaliwa / Date of Birth" required>
                    <Input type="date" className={fieldClass} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
                  </Field>
                  <Field label="Simu / Phone" required>
                    <Input className={fieldClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+255712345678" />
                  </Field>
                  <Field label="Namba ya WhatsApp / WhatsApp Number">
                    <div className="space-y-2">
                      <Input className={fieldClass} value={form.whatsappNumber} onChange={(e) => set('whatsappNumber', e.target.value)} placeholder="+255712345678" disabled={form.whatsappSameAsPhone} />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <Checkbox checked={form.whatsappSameAsPhone} onCheckedChange={(v) => set('whatsappSameAsPhone', v === true)} className="border-gray-300 data-[state=checked]:border-[#7A1F2B] data-[state=checked]:bg-[#7A1F2B]" />
                        Same as phone number
                      </label>
                    </div>
                  </Field>
                  <Field label="Barua Pepe / Email">
                    <Input type="email" className={fieldClass} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jina@example.com" />
                  </Field>
                  <Field label="Hali ya Ndoa / Marital Status" className="sm:col-span-2">
                    <Select value={form.maritalStatus} onValueChange={(v) => set('maritalStatus', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua hali ya ndoa" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nimeoa / Nimeolewa">Nimeoa / Nimeolewa (Married)</SelectItem>
                        <SelectItem value="Sijaoa / Sijaolewa">Sijaoa / Sijaolewa (Single)</SelectItem>
                        <SelectItem value="Mjane / Mgane">Mjane / Mgane (Widow/Widower)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-4 text-sm font-semibold text-[#7A1F2B]">Asili / Origin</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <LocationSelect label="Mkoa wa Asili / Origin Region" value={form.originRegion} onChange={setOriginRegion} options={TZ_REGIONS} placeholder="Chagua mkoa / Select region" />
                      <LocationSelect label="Wilaya ya Asili / Origin District" value={form.originDistrict} onChange={setOriginDistrict} options={originDistrictOptions} placeholder={form.originRegion ? 'Chagua wilaya / Select district' : 'Chagua mkoa kwanza'} disabled={!form.originRegion && originDistrictOptions.length === 0} />
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-6">
                    <p className="mb-4 text-sm font-semibold text-[#7A1F2B]">Mahali Unapoishi Sasa / Current Location</p>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <LocationSelect label="Mkoa / Region" value={form.currentRegion} onChange={setCurrentRegion} options={TZ_REGIONS} placeholder="Chagua mkoa / Select region" />
                      <LocationSelect label="Wilaya / District" value={form.currentDistrict} onChange={setCurrentDistrict} options={currentDistrictOptions} placeholder={form.currentRegion ? 'Chagua wilaya / Select district' : 'Chagua mkoa kwanza'} disabled={!form.currentRegion && currentDistrictOptions.length === 0} />
                      <LocationSelect label="Kata / Ward" value={form.currentWard} onChange={setCurrentWard} options={currentWardOptions} placeholder={form.currentDistrict ? 'Chagua kata / Select ward' : 'Chagua wilaya kwanza'} disabled={!form.currentDistrict && currentWardOptions.length === 0} />
                      <Field label="Mtaa / Street">
                        <Input className={fieldClass} value={form.currentStreet} onChange={(e) => set('currentStreet', e.target.value)} placeholder="Andika mtaa / Write street" />
                      </Field>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">Kama eneo lako halipo kwenye orodha, chagua &quot;Other / Andika mwenyewe&quot;.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Hali ya Ajira / Employment Status">
                    <Select value={form.employmentStatus} onValueChange={(v) => set('employmentStatus', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua hali" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employed">Employed / Ameajiriwa</SelectItem>
                        <SelectItem value="Self-Employed">Self-Employed / Kujiajiri</SelectItem>
                        <SelectItem value="Student">Student / Mwanafunzi</SelectItem>
                        <SelectItem value="Unemployed">Unemployed / Hana Ajira</SelectItem>
                        <SelectItem value="Retired">Retired / Mstaafu</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Kazi / Occupation">
                    <Input className={fieldClass} value={form.occupation} onChange={(e) => set('occupation', e.target.value)} placeholder="Mf. Mwalimu, Mfanyabiashara" />
                  </Field>
                  <div className="sm:col-span-2 border-t border-gray-100 pt-2" />
                  <Field label="Jina la Mawasiliano ya Dharura / Emergency Contact Name">
                    <Input className={fieldClass} value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} />
                  </Field>
                  <Field label="Simu ya Dharura / Emergency Contact Phone">
                    <Input className={fieldClass} value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} placeholder="+255..." />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nafasi ya Sasa Kanisani / Current Position">
                    <Select value={form.currentPosition} onValueChange={(v) => set('currentPosition', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua nafasi" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hakuna/None">Hakuna / None</SelectItem>
                        <SelectItem value="Praise Team Member">Praise Team Member</SelectItem>
                        <SelectItem value="Usher">Usher</SelectItem>
                        <SelectItem value="Deacon/Ushemasi">Deacon / Ushemasi</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Ushemasi">
                    <Input className={fieldClass} value={form.ushemasi} onChange={(e) => set('ushemasi', e.target.value)} placeholder="Andika kama una nafasi ya ushemasi" />
                  </Field>
                  <Field label="Muda Uliokaa Kanisani / Time in Church">
                    <Input className={fieldClass} value={form.timeInChurch} onChange={(e) => set('timeInChurch', e.target.value)} placeholder="Mf. Miaka 2, Miezi 6" />
                  </Field>
                  <Field label="Unatarajia Kukaa Kwa Muda Gani Hapa? / Expected Stay Duration">
                    <Input className={fieldClass} value={form.expectedStayDuration} onChange={(e) => set('expectedStayDuration', e.target.value)} placeholder="Mf. Muda wote, Miaka 3" />
                  </Field>
                  <Field label="Hali ya Ubatizo / Baptism Status">
                    <Select value={form.baptismStatus} onValueChange={(v) => set('baptismStatus', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua hali ya ubatizo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Amebatizwa">Amebatizwa</SelectItem>
                        <SelectItem value="Hajabatizwa">Hajabatizwa</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Idara Unayotaka Kujiunga / Desired Department">
                    <Select value={form.desiredDepartment} onValueChange={(v) => set('desiredDepartment', v)}>
                      <SelectTrigger className={selectTriggerClass}><SelectValue placeholder="Chagua idara" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hakuna, Nataka kuwa Mshirika tu">Hakuna, Nataka kuwa Mshirika tu</SelectItem>
                        <SelectItem value="CMF">CMF</SelectItem>
                        <SelectItem value="WWK">WWK</SelectItem>
                        <SelectItem value="CA's">CA&apos;s</SelectItem>
                        <SelectItem value="Children & Students">Children &amp; Students</SelectItem>
                        <SelectItem value="DMS">DMS</SelectItem>
                        <SelectItem value="Prayer">Prayer</SelectItem>
                        <SelectItem value="Mission">Mission</SelectItem>
                        <SelectItem value="Evangelism">Evangelism</SelectItem>
                        <SelectItem value="Maandiko & Mafundisho">Maandiko &amp; Mafundisho</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#C9962B]/20 bg-[#C9962B]/5 p-4 text-sm text-[#7A5A10]">
                    Tafadhali kagua taarifa zako. Bonyeza &quot;Back&quot; kurekebisha kabla ya kutuma.
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#7A1F2B]">Taarifa Binafsi</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewItem label="Full Name" value={form.fullName} />
                      <ReviewItem label="Gender" value={form.gender} />
                      <ReviewItem label="Date of Birth" value={form.dateOfBirth} />
                      <ReviewItem label="Phone" value={form.phone} />
                      <ReviewItem label="WhatsApp" value={form.whatsappNumber || form.phone} />
                      <ReviewItem label="Email" value={form.email} />
                      <ReviewItem label="Marital Status" value={form.maritalStatus} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#7A1F2B]">Mahali</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewItem label="Origin" value={[form.originDistrict, form.originRegion].filter(Boolean).join(', ')} />
                      <ReviewItem label="Current Location" value={[form.currentStreet, form.currentWard, form.currentDistrict, form.currentRegion].filter(Boolean).join(', ')} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#7A1F2B]">Kazi & Dharura</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewItem label="Employment Status" value={form.employmentStatus} />
                      <ReviewItem label="Occupation" value={form.occupation} />
                      <ReviewItem label="Emergency Contact" value={[form.emergencyContactName, form.emergencyContactPhone].filter(Boolean).join(' - ')} />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#7A1F2B]">Kanisa</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReviewItem label="Current Position" value={form.currentPosition} />
                      <ReviewItem label="Ushemasi" value={form.ushemasi} />
                      <ReviewItem label="Time in Church" value={form.timeInChurch} />
                      <ReviewItem label="Expected Stay" value={form.expectedStayDuration} />
                      <ReviewItem label="Baptism Status" value={form.baptismStatus} />
                      <ReviewItem label="Desired Department" value={form.desiredDepartment} />
                    </div>
                  </div>

                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition-colors hover:border-[#C9962B]/40">
                    <Checkbox
                      checked={confirmed}
                      onCheckedChange={(v) => setConfirmed(v === true)}
                      className="mt-0.5 border-gray-300 data-[state=checked]:border-[#7A1F2B] data-[state=checked]:bg-[#7A1F2B]"
                    />
                    <span className="text-sm leading-relaxed text-gray-700">
                      Nathibitisha kuwa taarifa nilizotoa ni sahihi na nakubali kuwa mwanafamilia wa TAG Forest ya Kwanza.{' '}
                      <span className="text-[#7A1F2B]">*</span>
                    </span>
                  </label>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={back}
                  disabled={step === 0 || submitting}
                  className="h-11 rounded-xl border-gray-200 px-5 text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>

                {step < steps.length - 1 ? (
                  <Button type="button" onClick={next} className="h-11 rounded-xl bg-[#7A1F2B] px-6 text-white shadow-sm hover:bg-[#651925]">
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={submitting || !confirmed}
                    className="h-11 rounded-xl bg-[#7A1F2B] px-6 text-white shadow-sm hover:bg-[#651925] disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-gray-500">
            Kwa msaada, wasiliana na ofisi ya kanisa. Your information is handled confidentially.
          </p>
        </div>
      </section>
    </Layout>
  );
}
