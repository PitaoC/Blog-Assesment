import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Blog {
  id: string;
  title: string;
  content: string;
  author_id: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface BlogsState {
  list: Blog[];
  loading: boolean;
  error: string | null;
}

const initialState: BlogsState = {
  list: [],
  loading: false,
  error: null,
};

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
    updateBlog: (state, action: PayloadAction<Blog>) => {
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
  },
});

export const { setBlogs, addBlog, updateBlog, removeBlog, setLoading, setError } = blogsSlice.actions;
export default blogsSlice.reducer;