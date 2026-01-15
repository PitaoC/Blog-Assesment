import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabase';

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface BlogsState {
  list: Blog[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

const initialState: BlogsState = {
  list: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { getState }) => {
    getState() as { blogs: BlogsState };
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;
    const totalPages = Math.ceil((count || 0) / limit);
    return { blogs: data || [], totalPages, hasMore: page < totalPages };
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async ({ title, content }: { title: string; content: string }) => {
    const { data, error } = await supabase
      .from('blogs')
      .insert([{ title, content }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, title, content }: { id: string; title: string; content: string }) => {
    const { data, error } = await supabase
      .from('blogs')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
);

const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setBlogs: (state, action: PayloadAction<Blog[]>) => {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    addBlog: (state, action: PayloadAction<Blog>) => {
      state.list.unshift(action.payload);
    },
    updateBlogInList: (state, action: PayloadAction<Blog>) => {
      const index = state.list.findIndex(blog => blog.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    removeBlog: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(blog => blog.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.list = action.payload.blogs;
        } else {
          state.list = [...state.list, ...action.payload.blogs];
        }
        state.totalPages = action.payload.totalPages;
        state.hasMore = action.payload.hasMore;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch blogs';
        state.loading = false;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.list.findIndex(blog => blog.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { setBlogs, addBlog, updateBlogInList, removeBlog, setLoading, setError, setPage } = blogsSlice.actions;
export default blogsSlice.reducer;