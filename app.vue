<script setup lang="ts">
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME } from '~/utils/site-meta'

useSchemaOrg([
  defineWebSite({
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: SITE_LOCALE,
  }),
  defineWebPage(),
])
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
