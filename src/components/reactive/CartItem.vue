<script lang="js" setup>
import { onMounted, ref } from "vue";
import { Fetcher } from "../../utils/fetchUtils";

const props = defineProps({
    article: Number,
    title: {
        type: String,
        default: "Titre de l'article",
    },
    price: {
        type: Number,
        default: 100,
    },
    image: {
        type: String,
        default: "/image-sample.webp",
    },
});

const $article = ref({});

onMounted(() => {
    console.log(`${import.meta.env.PUBLIC_API_URL}`);
    const fetchUrl = "wp-json/wc/v3/products/";
    const request = new Fetcher();
    console.log(fetchUrl + props.article);
    const data = request.fetchData(fetchUrl + props.article);
    $article.value = data;
});
</script>

<template>
    <div class="Article">
        {{ $article }}
        <img class="Article__image" :src="image" alt="" />
        <div class="Article__infos">
            <h3 class="Article__infos__title">{{ title }}</h3>
            <span class="Article__infos__price">{{ price }} €</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.Article {
    border-bottom: 1px solid black;
    display: flex;
    gap: 1rem;
    padding: 1rem;
    &__image {
        max-width: 96px;
    }
}
</style>
