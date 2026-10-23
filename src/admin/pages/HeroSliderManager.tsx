import React, { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { GripVertical, Images, Pencil, Plus, Trash2 } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';
import { refreshPublicContent } from '../../lib/publicApi';
import type { ApiResponse, HeroSlide } from '../../lib/types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { ImageUploader, type UploadedImage } from '../components/ImageUploader';

const SLIDES_KEY = ['admin', 'slides'] as const;
const IMAGE_HINT = 'Recommended 1920x900 px, JPG/WEBP, under 300 KB';

interface SlideFormData {
  alt: string;
}

interface SlideModalProps {
  open: boolean;
  slide?: HeroSlide | null;
  onClose: () => void;
  onSaved: () => void;
}

/** Add / edit slide dialog (upload or paste image URL + alt text). */
const SlideModal: React.FC<SlideModalProps> = ({ open, slide, onClose, onSaved }) => {
  const isEdit = Boolean(slide);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SlideFormData>({ defaultValues: { alt: '' } });

  // Re-seed the form whenever the modal opens.
  React.useEffect(() => {
    if (!open) return;
    reset({ alt: slide?.alt || '' });
    setImage(slide ? { url: slide.image, publicId: slide.publicId || '' } : null);
    setUrlDraft('');
  }, [open, slide, reset]);

  const effectiveImage = image?.url || urlDraft.trim();

  const onSubmit = async (values: SlideFormData) => {
    if (!effectiveImage) {
      toast.error('Please upload an image or paste an image URL');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        image: effectiveImage,
        publicId: image?.publicId || '',
        alt: values.alt.trim(),
      };

      if (isEdit && slide) {
        await api.put(`/admin/slides/${slide._id}`, payload);
        toast.success('Slide updated');
      } else {
        await api.post('/admin/slides', { ...payload, isActive: true });
        toast.success('Slide added');
      }
      onSaved();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save slide'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Slide' : 'Add Hero Slide'}
      description={
        isEdit
          ? 'Update the alt text or replace the image.'
          : 'New slides appear on the homepage hero carousel.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={saving}>
            {isEdit ? 'Save Changes' : 'Add Slide'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Slide Image *
          </label>
          <ImageUploader
            value={image?.url}
            onChange={(next) => {
              setImage(next);
              if (next) setUrlDraft('');
            }}
            hint={IMAGE_HINT}
            disabled={saving}
          />
          <div className="mt-3">
            <label htmlFor="slide-url" className="block text-[11px] font-semibold text-slate-500 mb-1">
              …or paste an image URL
            </label>
            <input
              id="slide-url"
              type="url"
              placeholder="https://…/hero-slide.jpg"
              value={urlDraft}
              onChange={(event) => {
                setUrlDraft(event.target.value);
                if (event.target.value) setImage(null);
              }}
              disabled={saving || Boolean(image)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="slide-alt" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Alt Text *
          </label>
          <input
            id="slide-alt"
            type="text"
            placeholder="e.g. E-commerce product retouching showcase"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            aria-invalid={errors.alt ? 'true' : 'false'}
            {...register('alt', {
              required: 'Alt text is required',
              minLength: { value: 3, message: 'Alt text is too short' },
            })}
          />
          {errors.alt && (
            <p className="mt-1.5 text-xs text-red-500 font-medium" role="alert">
              {errors.alt.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

interface SortableRowProps {
  slide: HeroSlide;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ slide, busy, onEdit, onDelete, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide._id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 bg-white border-b border-slate-100 last:border-b-0 ${
        isDragging ? 'shadow-lg rounded-xl ring-2 ring-amber-300' : ''
      } ${busy ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="p-2 -ml-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 cursor-grab active:cursor-grabbing touch-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-label={`Reorder slide: ${slide.alt}`}
        disabled={busy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Thumbnail */}
      <div className="w-24 h-14 sm:w-32 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
        <img
          src={slide.image}
          alt={slide.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Alt text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700 truncate">{slide.alt}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Order {slide.order + 1}</p>
      </div>

      {/* Active toggle */}
      <button
        type="button"
        onClick={onToggle}
        disabled={busy}
        className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
        aria-label={slide.isActive ? 'Deactivate slide' : 'Activate slide'}
        title={slide.isActive ? 'Active — click to hide' : 'Inactive — click to show'}
      >
        <span
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            slide.isActive ? 'bg-amber-400' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              slide.isActive ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
      </button>

      <Badge tone={slide.isActive ? 'green' : 'slate'} className="hidden sm:inline-flex shrink-0">
        {slide.isActive ? 'Active' : 'Hidden'}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          disabled={busy}
          className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label={`Edit slide: ${slide.alt}`}
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label={`Delete slide: ${slide.alt}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/** Hero Slider manager: list, drag-and-drop reorder, add/edit, toggle, delete. */
export const HeroSliderManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editSlide, setEditSlide] = useState<HeroSlide | null>(null);
  const [deleteSlide, setDeleteSlide] = useState<HeroSlide | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const savingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const slidesQuery = useQuery({
    queryKey: SLIDES_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<HeroSlide[]>>('/admin/slides');
      return res.data.data;
    },
  });

  const slides = useMemo(() => slidesQuery.data || [], [slidesQuery.data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: SLIDES_KEY });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<HeroSlide>>(`/admin/slides/${id}/toggle`);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<HeroSlide[]>(SLIDES_KEY, (old) =>
        (old || []).map((slide) => (slide._id === updated._id ? updated : slide))
      );
      toast.success(updated.isActive ? 'Slide activated' : 'Slide hidden');
      refreshPublicContent(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update slide')),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/slides/${id}`);
    },
    onSuccess: () => {
      toast.success('Slide deleted');
      setDeleteSlide(null);
      void invalidate();
      refreshPublicContent(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete slide')),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || reorderBusy) return;

    const oldIndex = slides.findIndex((slide) => slide._id === active.id);
    const newIndex = slides.findIndex((slide) => slide._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(slides, oldIndex, newIndex);
    queryClient.setQueryData<HeroSlide[]>(SLIDES_KEY, reordered);

    setReorderBusy(true);
    savingRef.current = true;
    try {
      await api.put('/admin/slides/reorder', reordered.map((slide, index) => ({
        id: slide._id,
        order: index,
      })));
      toast.success('Order saved');
      refreshPublicContent(queryClient);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save order'));
      await invalidate();
    } finally {
      setReorderBusy(false);
      savingRef.current = false;
    }
  };

  const loading = slidesQuery.isLoading;
  const error = slidesQuery.isError;

  return (
    <div>
      <PageHeader
        title="Hero Slider"
        description="Manage the homepage hero carousel. Drag rows to reorder."
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
            Add Slide
          </Button>
        }
      />

      <Card flush>
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="w-4 h-8" />
                <Skeleton className="w-32 h-16 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-11 rounded-full" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Images}
            title="Could not load slides"
            description="Something went wrong while fetching the hero slides. Try refreshing the page."
            action={<Button variant="secondary" onClick={() => void invalidate()}>Retry</Button>}
          />
        ) : slides.length === 0 ? (
          <EmptyState
            icon={Images}
            title="No hero slides yet"
            description="Add your first slide to show a rotating hero background on the homepage."
            action={
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
                Add Slide
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slides.map((slide) => slide._id)} strategy={verticalListSortingStrategy}>
              <div className="relative">
                {slides.map((slide) => (
                  <SortableRow
                    key={slide._id}
                    slide={slide}
                    busy={reorderBusy || toggleMutation.isPending || deleteMutation.isPending}
                    onEdit={() => setEditSlide(slide)}
                    onDelete={() => setDeleteSlide(slide)}
                    onToggle={() => toggleMutation.mutate(slide._id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {slides.length > 0 && !loading && (
          <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              {slides.length} slide{slides.length === 1 ? '' : 's'} · {slides.filter((s) => s.isActive).length} active
            </p>
            <p className="text-[11px] text-slate-400 hidden sm:block">{IMAGE_HINT}</p>
          </div>
        )}
      </Card>

      {/* Add modal */}
      <SlideModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          void invalidate();
          refreshPublicContent(queryClient);
        }}
      />

      {/* Edit modal */}
      <SlideModal
        open={Boolean(editSlide)}
        slide={editSlide}
        onClose={() => setEditSlide(null)}
        onSaved={() => {
          void invalidate();
          refreshPublicContent(queryClient);
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteSlide)}
        title="Delete slide?"
        message={`"${deleteSlide?.alt || ''}" will be permanently removed from the homepage carousel.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteSlide && deleteMutation.mutate(deleteSlide._id)}
        onCancel={() => setDeleteSlide(null)}
      />
    </div>
  );
};

export default HeroSliderManager;
