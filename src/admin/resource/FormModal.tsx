import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../../lib/api';
import { refreshPublicContent } from '../../lib/publicApi';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

interface FormModalProps<V extends FieldValues> {
  open: boolean;
  title: string;
  description?: string;
  /** Backend resource path under /admin (used for POST/PUT). */
  resource: string;
  /** The item being edited, or null when creating. */
  item?: { _id: string } | null;
  methods: UseFormReturn<V>;
  /** Build the API payload from form values. */
  toPayload: (values: V) => Record<string, unknown>;
  /** Extra client-side validation; return an error message or null. */
  validate?: (values: V) => string | null;
  onClose: () => void;
  onSaved: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Generic add/edit modal: owns react-hook-form submission, POST/PUT to the
 * backend, toasts and the Cancel/Save footer. Fields are passed as children.
 */
export function FormModal<V extends FieldValues>({
  open,
  title,
  description,
  resource,
  item,
  methods,
  toPayload,
  validate,
  onClose,
  onSaved,
  children,
  size = 'md',
}: FormModalProps<V>) {
  const [saving, setSaving] = React.useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(item);

  const onSubmit = methods.handleSubmit(async (values) => {
    if (validate) {
      const message = validate(values);
      if (message) {
        toast.error(message);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = toPayload(values);
      if (isEdit && item) {
        await api.put(`/admin/${resource}/${item._id}`, payload);
        toast.success('Saved');
      } else {
        await api.post(`/admin/${resource}`, payload);
        toast.success('Created');
      }
      refreshPublicContent(queryClient);
      onSaved();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} loading={saving}>
            {isEdit ? 'Save Changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
        className="space-y-5"
        noValidate
      >
        {children}
      </form>
    </Modal>
  );
}

export default FormModal;
