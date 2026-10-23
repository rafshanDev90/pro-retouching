import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import api, { getApiErrorMessage } from '../../lib/api';
import { refreshPublicContent } from '../../lib/publicApi';
import type { ApiResponse } from '../../lib/types';

interface UseResourceManagerOptions<T> {
  /** Backend path under /admin, e.g. 'services'. */
  resource: string;
  /** React-query cache key, e.g. 'services'. */
  queryKey: string;
  hasToggle?: boolean;
  canReorder?: boolean;
  /** Client-side search over these fields. */
  searchKeys?: (keyof T & string)[];
  /** Extra client-side filter (e.g. category select). */
  extraFilter?: (item: T) => boolean;
}

export interface ResourceManagerHook<T extends { _id: string }> {
  items: T[];
  visible: T[];
  isLoading: boolean;
  isError: boolean;
  invalidate: () => void;
  search: string;
  setSearch: (value: string) => void;
  addOpen: boolean;
  editItem: T | null;
  deleteItem: T | null;
  openAdd: () => void;
  openEdit: (item: T) => void;
  closeForm: () => void;
  requestDelete: (item: T) => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  deleting: boolean;
  toggle: (item: T) => void;
  toggling: boolean;
  reorderBusy: boolean;
  onDragEnd: (event: DragEndEvent) => void;
  total: number;
  activeCount: number;
}

/**
 * Shared CRUD state for every content manager: list query, search, modal
 * states, toggle, delete-with-confirm and drag-and-drop reorder.
 */
export function useResourceManager<T extends { _id: string; isActive?: boolean; order?: number }>(
  options: UseResourceManagerOptions<T>
): ResourceManagerHook<T> {
  const {
    resource,
    queryKey,
    hasToggle = false,
    canReorder = false,
    searchKeys = [],
    extraFilter,
  } = options;

  const queryClient = useQueryClient();
  const cacheKey = ['admin', queryKey];
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [deleteItem, setDeleteItem] = useState<T | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);

  const listQuery = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const res = await api.get<ApiResponse<T[]>>(`/admin/${resource}`);
      return res.data.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: cacheKey });

  const items = useMemo(() => listQuery.data || [], [listQuery.data]);

  const visible = useMemo(() => {
    let result = items;
    if (extraFilter) result = result.filter(extraFilter);
    const term = search.trim().toLowerCase();
    if (term && searchKeys.length > 0) {
      result = result.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(term))
      );
    }
    return result;
  }, [items, search, searchKeys, extraFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/${resource}/${id}`);
    },
    onSuccess: () => {
      toast.success('Deleted');
      setDeleteItem(null);
      void invalidate();
      refreshPublicContent(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to delete')),
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<T>>(`/admin/${resource}/${id}/toggle`);
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<T[]>(cacheKey, (old) =>
        (old || []).map((item) => (item._id === updated._id ? updated : item))
      );
      toast.success(updated.isActive ? 'Activated' : 'Deactivated');
      refreshPublicContent(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'Failed to update')),
  });

  const onDragEnd = async (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id || reorderBusy) return;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    queryClient.setQueryData<T[]>(cacheKey, reordered);

    setReorderBusy(true);
    try {
      await api.put(
        `/admin/${resource}/reorder`,
        reordered.map((item, index) => ({ id: item._id, order: index }))
      );
      toast.success('Order saved');
      refreshPublicContent(queryClient);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save order'));
      await invalidate();
    } finally {
      setReorderBusy(false);
    }
  };

  return {
    items,
    visible,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    invalidate,
    search,
    setSearch,
    addOpen,
    editItem,
    deleteItem,
    openAdd: () => setAddOpen(true),
    openEdit: (item: T) => setEditItem(item),
    closeForm: () => {
      setAddOpen(false);
      setEditItem(null);
    },
    requestDelete: (item: T) => setDeleteItem(item),
    cancelDelete: () => setDeleteItem(null),
    confirmDelete: () => {
      if (deleteItem) deleteMutation.mutate(deleteItem._id);
    },
    deleting: deleteMutation.isPending,
    toggle: hasToggle ? (item: T) => toggleMutation.mutate(item._id) : () => undefined,
    toggling: toggleMutation.isPending,
    reorderBusy,
    onDragEnd,
    total: items.length,
    activeCount: items.filter((item) => item.isActive !== false).length,
  };
}
