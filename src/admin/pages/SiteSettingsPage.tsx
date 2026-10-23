import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building, Info, Linkedin, Plus, Save, Tag, Trash2 } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';
import { refreshPublicContent } from '../../lib/publicApi';
import type { ApiResponse, SiteSettings } from '../../lib/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { TextField, TextAreaField } from '../resource/fields';

type TabKey = 'contact' | 'social' | 'about' | 'stats';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'contact', label: 'Contact Info', icon: <Building className="w-4 h-4" /> },
  { key: 'social', label: 'Social Links', icon: <Linkedin className="w-4 h-4" /> },
  { key: 'about', label: 'About & Why Choose', icon: <Info className="w-4 h-4" /> },
  { key: 'stats', label: 'Price Highlights', icon: <Tag className="w-4 h-4" /> },
];

interface SettingsFormValues {
  siteName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  social: {
    facebook: string;
    linkedin: string;
    skype: string;
    whatsapp: string;
  };
  aboutText: string;
  footerText: string;
  whyChoose: { title: string; desc: string }[];
  priceHighlights: { title: string; value: string; subtext: string }[];
}

const defaultValues: SettingsFormValues = {
  siteName: '',
  tagline: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  social: { facebook: '', linkedin: '', skype: '', whatsapp: '' },
  aboutText: '',
  footerText: '',
  whyChoose: [],
  priceHighlights: [],
};

export const SiteSettingsPage: React.FC = () => {
  const [tab, setTab] = React.useState<TabKey>('contact');
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SiteSettings>>('/admin/settings');
      return res.data.data;
    },
  });

  const methods = useForm<SettingsFormValues>({ defaultValues });
  const { register, control, reset, handleSubmit, formState, watch } = methods;

  const whyChooseArray = useFieldArray({ control, name: 'whyChoose' });
  const highlightsArray = useFieldArray({ control, name: 'priceHighlights' });

  React.useEffect(() => {
    if (settingsQuery.data) {
      const data = settingsQuery.data;
      reset({
        siteName: data.siteName || '',
        tagline: data.tagline || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        address: data.address || '',
        social: {
          facebook: data.social?.facebook || '',
          linkedin: data.social?.linkedin || '',
          skype: data.social?.skype || '',
          whatsapp: data.social?.whatsapp || '',
        },
        aboutText: data.aboutText || '',
        footerText: data.footerText || '',
        whyChoose: data.whyChoose?.length
          ? data.whyChoose.map((item) => ({ title: item.title, desc: item.desc }))
          : [],
        priceHighlights: data.priceHighlights?.length
          ? data.priceHighlights.map((item) => ({
              title: item.title,
              value: item.value,
              subtext: item.subtext,
            }))
          : [],
      });
    }
  }, [settingsQuery.data, reset]);

  const saveMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      await api.put('/admin/settings', values);
    },
    onSuccess: () => {
      toast.success('Settings saved');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      refreshPublicContent(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to save settings')),
  });

  const onSubmit = handleSubmit((values) => saveMutation.mutate(values));

  if (settingsQuery.isLoading) {
    return (
      <div>
        <PageHeader title="Site Settings" description="Global website configuration." />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  if (settingsQuery.isError) {
    return (
      <div>
        <PageHeader title="Site Settings" description="Global website configuration." />
        <Card>
          <EmptyState
            icon={Building}
            title="Could not load settings"
            description="Something went wrong. Try refreshing."
            action={
              <Button variant="secondary" onClick={() => void settingsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Site Settings"
        description="Manage global website information shown in the header, footer, and contact sections."
        actions={
          <Button
            icon={<Save className="w-4 h-4" />}
            onClick={() => void onSubmit()}
            loading={saveMutation.isPending}
          >
            Save Changes
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              tab === t.key
                ? 'bg-brand-navy text-white shadow-md shadow-navy-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400 hover:text-amber-600'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={(event) => { event.preventDefault(); void onSubmit(); }} noValidate>
        {tab === 'contact' && (
          <div className="space-y-6">
            <Card title="Brand">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Site Name" placeholder="Pro Retouching" {...register('siteName')} />
                <TextField label="Tagline" placeholder="Professional photo editing" {...register('tagline')} />
              </div>
            </Card>
            <Card title="Contact Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <TextField label="Phone" placeholder="+1 234 567 890" {...register('phone')} />
                <TextField label="WhatsApp" placeholder="+1 234 567 890" {...register('whatsapp')} />
                <TextField label="Email" type="email" placeholder="hello@example.com" {...register('email')} />
                <TextField label="Address" placeholder="123 Main St, City" {...register('address')} />
              </div>
            </Card>
            <Card title="Footer">
              <TextAreaField
                label="Footer Text"
                rows={2}
                placeholder="Shown in the site footer."
                {...register('footerText')}
              />
            </Card>
          </div>
        )}

        {tab === 'social' && (
          <Card title="Social Media Links">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField
                label="Facebook URL"
                placeholder="https://facebook.com/…"
                {...register('social.facebook')}
              />
              <TextField
                label="LinkedIn URL"
                placeholder="https://linkedin.com/…"
                {...register('social.linkedin')}
              />
              <TextField
                label="Skype ID"
                placeholder="your-skype-id"
                {...register('social.skype')}
              />
              <TextField
                label="WhatsApp Number"
                placeholder="+1 234 567 890"
                {...register('social.whatsapp')}
              />
            </div>
          </Card>
        )}

        {tab === 'about' && (
          <div className="space-y-6">
            <Card title="About">
              <TextAreaField
                label="About Text"
                rows={5}
                placeholder="Company story / about section content."
                {...register('aboutText')}
              />
            </Card>

            <Card
              title="Why Choose Us"
              subtitle="Reasons shown in the Why Choose section."
              actions={
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => whyChooseArray.append({ title: '', desc: '' })}
                >
                  Add Reason
                </Button>
              }
            >
              {whyChooseArray.fields.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No reasons added yet.</p>
              ) : (
                <div className="space-y-4">
                  {whyChooseArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex-1 space-y-3">
                        <TextField
                          label={`Reason ${index + 1} — Title`}
                          placeholder="e.g. 100% Manual Editing"
                          {...register(`whyChoose.${index}.title` as const)}
                        />
                        <TextAreaField
                          label="Description"
                          rows={2}
                          placeholder="Short supporting text."
                          {...register(`whyChoose.${index}.desc` as const)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => whyChooseArray.remove(index)}
                        className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label="Remove reason"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-6">
            <Card
              title="Price Highlights"
              subtitle="Cards shown above the pricing table."
              actions={
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => highlightsArray.append({ title: '', value: '', subtext: '' })}
                >
                  Add Highlight
                </Button>
              }
            >
              {highlightsArray.fields.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No highlights added yet.</p>
              ) : (
                <div className="space-y-4">
                  {highlightsArray.fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-3 items-start bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <TextField
                          label="Title"
                          placeholder="e.g. Volume Discounts"
                          {...register(`priceHighlights.${index}.title` as const)}
                        />
                        <TextField
                          label="Value"
                          placeholder="e.g. 20% OFF"
                          {...register(`priceHighlights.${index}.value` as const)}
                        />
                        <TextField
                          label="Subtext"
                          placeholder="e.g. on 500+ images"
                          {...register(`priceHighlights.${index}.subtext` as const)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => highlightsArray.remove(index)}
                        className="mt-6 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                        aria-label="Remove highlight"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Sticky save bar */}
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            icon={<Save className="w-4 h-4" />}
            loading={saveMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SiteSettingsPage;
