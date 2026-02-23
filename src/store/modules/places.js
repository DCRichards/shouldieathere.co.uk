import FHRS from '@/api/FHRS';
import {
  PLACES_SET,
  PLACES_LOADING,
  PLACES_SELECTED,
  PLACES_ERROR,
} from '../types';

const { VUE_APP_API_URL } = process.env;
const fhrs = new FHRS({ baseUrl: VUE_APP_API_URL });

export default {
  namespaced: true,

  state: {
    places: [],
    query: {},
    pagination: {
      page: 0,
      perPage: 0,
      totalPages: 0,
    },
    id: undefined,
    loading: false,
    error: undefined,
  },

  getters: {
    place({ id, places }) {
      if (!id) {
        return undefined;
      }

      return places.find(({ FHRSID }) => `${FHRSID}` === id);
    },
  },

  actions: {
    async search({ commit, state }, {
      name, address, page = 1, perPage = 20,
    }) {
      const alreadyLoaded = state.query
        && state.query.name === name
        && state.query.address === address
        && state.pagination.page === page
        && state.pagination.perPage === perPage;

      if (alreadyLoaded) {
        return;
      }

      commit(PLACES_LOADING);

      const searchName = name ? name.trim() : name;
      const searchAddress = address ? address.trim() : address;

      try {
        const { data } = await fhrs.establishments.search(searchName, searchAddress, page, perPage);
        commit(PLACES_SET, {
          query: {
            name,
            address,
          },
          places: data.establishments,
          totalPages: data.meta.totalPages,
          page,
          perPage,
        });
      } catch (error) {
        commit(PLACES_ERROR, error);
      }
    },

    async get({ commit, state }, { id }) {
      commit(PLACES_SELECTED, id);

      const place = state.places.find(({ FHRSID }) => `${FHRSID}` === id);
      if (place) {
        return;
      }

      try {
        commit(PLACES_LOADING);
        const { data } = await fhrs.establishments.get(id);
        commit(PLACES_SET, {
          places: [data],
          page: 0,
          perPage: 0,
          totalPages: 0,
        });
      } catch (error) {
        commit(PLACES_ERROR, error);
      }
    },
  },

  mutations: {
    [PLACES_SET](state, {
      query, places, page, perPage, totalPages,
    }) {
      Object.assign(state, {
        places,
        pagination: {
          page,
          perPage,
          totalPages,
        },
        query,
        loading: false,
        error: undefined,
      });
    },

    [PLACES_LOADING](state) {
      Object.assign(state, { loading: true });
    },

    [PLACES_SELECTED](state, id) {
      Object.assign(state, { id });
    },

    [PLACES_ERROR](state, error) {
      Object.assign(state, { error, loading: false });
    },
  },
};
