<template>
  <div class="place">
    <c-loading v-if="loading" />
    <div
      class="place-detail"
      v-if="!loading && place">
      <div
        class="header__title">
        <h1>{{ place.BusinessName }}</h1>
        <h4>{{ formatAddress(place) }}</h4>
      </div>

      <div
        class="place__type">
        <div class="info__stamps">
          <div class="type-stamp">
            <component
              class="stamp__icon"
              :is="typeIcon" />
            <p>{{ place.BusinessType }}</p>
          </div>
        </div>
      </div>

      <div
        class="place__rating">
        <component
          class="rating__img"
          :is="ratingImage" />

        <h2 class="rating__text">
          {{ slogan }}
        </h2>
      </div>

      <div
        class="rating__details"
        v-if="!noRating">
        <h4>{{ $t('place.ratingDetails') }}</h4>
        <div class="info__stamps">
          <c-stamp icon="calendar">
            {{ ratingDate }} ({{ timeSinceRating }} ago)
          </c-stamp>
          <c-stamp
            class="authority-name"
            icon="check-square">
            {{ $t('place.ratedBy') }}
            <a
              target="_blank"
              :href="place.LocalAuthorityWebSite">{{ place.LocalAuthorityName }}
            </a>
          </c-stamp>
        </div>
      </div>
    </div>

    <div
      class="ratings__buttons"
      v-if="!loading">
      <router-link to="/">
        <c-button variant="dark">
          {{ $t('place.searchAgain') }}
        </c-button>
      </router-link>

      <router-link
        to="report"
        append>
        <c-button variant="dark">
          {{ $t('place.report') }}
        </c-button>
      </router-link>
    </div>
  </div>
</template>

<script>
import parseDate from 'date-fns/parse';
import formatDate from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';

import { mapGetters, mapState } from 'vuex';
import { address as addressMixin } from '@/mixins';

import constants from '@/constants';

import CButton from '@/components/core/Button.vue';
import CLoading from '@/components/core/Loading.vue';
import CStamp from '@/components/Stamp.vue';

import CafeIcon from '@/assets/images/icons/cafe.svg';
import MobileIcon from '@/assets/images/icons/mobile.svg';
import PubIcon from '@/assets/images/icons/pub.svg';
import RestaurantIcon from '@/assets/images/icons/restaurant.svg';
import TakeawayIcon from '@/assets/images/icons/takeaway.svg';
import BurgerIcon from '@/assets/images/icons/burger.svg';
import ChickenIcon from '@/assets/images/icons/chicken.svg';
import KebabIcon from '@/assets/images/icons/kebab.svg';

import RatingNa from '@/assets/images/ratings/na.svg';
import RatingZero from '@/assets/images/ratings/0.svg';
import RatingOne from '@/assets/images/ratings/1.svg';
import RatingTwo from '@/assets/images/ratings/2.svg';
import RatingThree from '@/assets/images/ratings/3.svg';
import RatingFour from '@/assets/images/ratings/4.svg';
import RatingFive from '@/assets/images/ratings/5.svg';
import RatingPass from '@/assets/images/ratings/pass.svg';
import RatingImprove from '@/assets/images/ratings/improve.svg';

function parseFlt(str) {
  const f = Number.parseFloat(str, 10);
  if (Number.isNaN(f)) {
    return undefined;
  }

  return f;
}

export default {
  mixins: [addressMixin],

  components: {
    CButton,
    CLoading,
    CStamp,
  },

  methods: {
    hasKeywords(words) {
      if (!this.place) {
        return false;
      }

      const name = this.place.BusinessName.toLowerCase();
      return words.some((w) => name.includes(w));
    },
  },

  computed: {
    ...mapGetters('places', ['place']),
    ...mapState('places', ['loading']),

    ratingDate() {
      const rated = parseDate(this.place.RatingDate, 'yyyy-MM-dd\'T\'HH:mm:ss', new Date());
      return formatDate(rated, 'do MMM yyyy');
    },

    timeSinceRating() {
      const rated = parseDate(this.place.RatingDate, 'yyyy-MM-dd\'T\'HH:mm:ss', new Date());
      return formatDistance(rated, new Date());
    },

    typeIcon() {
      const isBurger = this.hasKeywords(['burger', 'mcdonalds']);
      const isCafe = this.hasKeywords(['caffe', 'cafe', 'coffee']);
      const isChicken = this.hasKeywords(['chicken', 'nandos', 'kfc']);
      const isKebab = this.hasKeywords(['kebab']);

      if (isBurger) {
        return BurgerIcon;
      }

      if (isKebab) {
        return KebabIcon;
      }

      if (isCafe) {
        return CafeIcon;
      }

      if (isChicken) {
        return ChickenIcon;
      }

      switch (this.place.BusinessTypeID) {
        case 1:
          return RestaurantIcon;
        case 7843:
          return PubIcon;
        case 7844:
          return TakeawayIcon;
        case 7:
        case 14:
        case 7846:
          return MobileIcon;
        default:
          return TakeawayIcon;
      }
    },

    noRating() {
      const keys = [
        constants.FHRS_AWAITING_INSPECTION,
        constants.FHIS_AWAITING_INSPECTION,
        constants.FHRS_EXEMPT,
      ];
      return keys.includes(this.place.RatingKey);
    },

    ratingImage() {
      switch (this.place.RatingKey) {
        case constants.FHRS_0:
          return RatingZero;
        case constants.FHRS_1:
          return RatingOne;
        case constants.FHRS_2:
          return RatingTwo;
        case constants.FHRS_3:
          return RatingThree;
        case constants.FHRS_4:
          return RatingFour;
        case constants.FHRS_5:
          return RatingFive;
        case constants.FHIS_PASS:
          return RatingPass;
        case constants.FHIS_IMPROVEMENT_REQUIRED:
          return RatingImprove;
        case constants.FHRS_AWAITING_INSPECTION:
        case constants.FHIS_AWAITING_INSPECTION:
        default:
          return RatingNa;
      }
    },

    lat() {
      const { latitude } = this.place.geocode;
      return parseFlt(latitude);
    },

    lon() {
      const { longitude } = this.place.geocode;
      return parseFlt(longitude);
    },

    slogan() {
      const base = this.$t('ratings.default', [this.place.RatingValue]);

      switch (this.place.RatingKey) {
        case constants.FHRS_0:
          return this.$t('ratings.0');
        case constants.FHRS_1:
          return this.$t('ratings.1');
        case constants.FHRS_2:
          return this.$t('ratings.2');
        case constants.FHIS_IMPROVEMENT_REQUIRED:
        case constants.FHRS_3:
          return this.$t('ratings.3');
        case constants.FHRS_4:
          return this.$t('ratings.4');
        case constants.FHIS_PASS:
        case constants.FHRS_5:
          return this.$t('ratings.5');
        case constants.FHRS_EXEMPT:
          return this.$t('ratings.exempt');
        case constants.FHRS_AWAITING_INSPECTION:
        case constants.FHIS_AWAITING_INSPECTION:
          return this.$t('ratings.unknown');
        default:
          return base;
      }
    },
  },

  created() {
    const { id } = this.$route.params;
    this.$store.dispatch('places/get', { id });
  },
};
</script>

<style scoped lang="scss">
@import '~@/scss/colors';
@import '~@/scss/responsive';

.place {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
  margin: 2rem;
  text-align: center;
}

.header__title {
  margin-bottom: 1rem;

  h1 {
    margin-bottom: 0;
  }
}

.place__rating {
  margin: 2rem 0;
}

.rating__img {
  margin: 1rem;
  max-width: 768px;
}

.rating__text {
  margin: 0 1rem;
}

.place__map {
  margin: 1rem auto;
  max-width: 768px;
}

.authority-name a {
  text-decoration: underline;
}

.info__stamps {
  display: inline-block;
}

.place__type {
  text-align: center;
}

.stamp__icon {
  color: $basalt;
  height: 32px;
  margin-right: 10px;
  width: 32px;
}

.type-stamp {
  align-items: center;
  display: flex;
  padding: 0.25rem;
  width: auto;
}

.ratings__buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;

  @include screen-size('sm') {
    flex-direction: row;
  }
}
</style>
