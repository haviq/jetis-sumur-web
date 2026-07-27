<template>
  <div class="card p-5">
    <div v-if="showHeader" class="skeleton skeleton-title mb-4" />
    <div class="space-y-2">
      <div
        v-for="i in lines"
        :key="i"
        class="skeleton skeleton-text"
        :class="lineClass(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    lines?: number
    showHeader?: boolean
  }>(),
  {
    lines: 3,
    showHeader: true,
  },
)

function lineClass(i: number): string {
  // Alternate widths for a natural look
  const cycle = i % 3
  if (cycle === 1) return 'skeleton-full'
  if (cycle === 2) return 'skeleton-half'
  return 'skeleton-third'
}
</script>
