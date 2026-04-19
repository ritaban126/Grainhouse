import { createContext, useContext, useReducer, useCallback } from "react";
import { imageAPI } from "../api/services";

const ImageContext = createContext(null);

const initialState = {
  images:   [],
  total:    0,
  page:     1,
  pages:    1,
  loading:  false,
  error:    null,
  filters: {
    q:           "",
    niche:       "",
    orientation: "",
    isFree:      "",
    sort:        "-createdAt",
  },
};

const imageReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        images:  action.append ? [...state.images, ...action.payload.images] : action.payload.images,
        total:   action.payload.total,
        page:    action.payload.page,
        pages:   action.payload.pages,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload }, page: 1, images: [] };
    case "SET_PAGE":
      return { ...state, page: action.payload };
    default:
      return state;
  }
};

export const ImageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(imageReducer, initialState);

  const fetchImages = useCallback(async (overrides = {}, append = false) => {
    dispatch({ type: "FETCH_START" });
    try {
      const params = { ...state.filters, page: state.page, limit: 24, ...overrides };
      // Remove empty filter values
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const { data } = await imageAPI.getImages(params);
      dispatch({ type: "FETCH_SUCCESS", payload: data, append });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err.response?.data?.message || "Failed to load images." });
    }
  }, [state.filters, state.page]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const loadMore = useCallback(() => {
    if (state.page < state.pages) {
      dispatch({ type: "SET_PAGE", payload: state.page + 1 });
    }
  }, [state.page, state.pages]);

  return (
    <ImageContext.Provider value={{
      ...state,
      fetchImages,
      setFilters,
      loadMore,
      hasMore: state.page < state.pages,
    }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImages = () => {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error("useImages must be used within ImageProvider");
  return ctx;
};