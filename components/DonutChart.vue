<template>
  <div class="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
    <!-- SVG Donut Chart -->
    <div class="relative w-44 h-44 shrink-0">
      <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <!-- Background circle -->
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          stroke="var(--surface-soft)"
          stroke-width="12"
        />
        <!-- Segments -->
        <circle
          v-for="(seg, idx) in segments"
          :key="idx"
          cx="50"
          cy="50"
          r="40"
          fill="transparent"
          :stroke="colors[idx % colors.length]"
          stroke-width="12"
          :stroke-dasharray="strokeDashArray(seg.pct)"
          :stroke-dashoffset="strokeDashOffset(seg.accumPct)"
          class="transition-all duration-700 ease-out cursor-pointer hover:stroke-[14]"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        />
      </svg>
      <!-- Center text -->
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-xs muted">{{ hoveredItem ? hoveredItem.label : 'Total' }}</span>
        <span class="text-xl font-bold tracking-tight mt-0.5">
          {{ hoveredItem ? formatVal(hoveredItem.value) : formatVal(total) }}
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex-1 space-y-2.5 w-full">
      <div
        v-for="(item, idx) in sortedItems"
        :key="idx"
        class="flex items-center justify-between text-sm py-1 border-b border-border/10 cursor-pointer"
        :class="{ 'opacity-50': hoveredIndex !== null && hoveredIndex !== idx }"
        @mouseenter="hoveredIndex = idx"
        @mouseleave="hoveredIndex = null"
      >
        <div class="flex items-center gap-2">
          <span
            class="w-3 h-3 rounded-full shrink-0"
            :style="{ background: colors[idx % colors.length] }"
          />
          <span class="font-medium muted">{{ item.label }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-semibold tabular-nums">{{ item.value }}</span>
          <span class="text-xs muted w-10 text-right font-mono">{{ Math.round(item.pct) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  items: { label: string; value: number }[]
  colors?: string[]
}>()

const colors = props.colors || [
  '#00d4ff', // primary/accent
  '#ea4b71', // accent-2
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#3b82f6', // blue
]

const hoveredIndex = ref<number | null>(null)

const total = computed(() => {
  return props.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
})

const sortedItems = computed(() => {
  const list = props.items.map((x) => ({
    label: x.label,
    value: Number(x.value) || 0,
    pct: total.value > 0 ? ((Number(x.value) || 0) / total.value) * 100 : 0,
  }))
  return list.sort((a, b) => b.value - a.value)
})

const segments = computed(() => {
  let accumPct = 0
  return sortedItems.value.map((item) => {
    const res = {
      ...item,
      accumPct,
    }
    accumPct += item.pct
    return res
  })
})

const hoveredItem = computed(() => {
  if (hoveredIndex.value === null) return null
  return sortedItems.value[hoveredIndex.value] || null
})

// Hitung stroke dash array (2 * pi * r = 2 * 3.14159 * 40 = 251.32)
function strokeDashArray(pct: number): string {
  const circum = 2 * Math.PI * 40 // 251.327
  const fill = (pct / 100) * circum
  const rest = circum - fill
  return `${fill} ${rest}`
}

function strokeDashOffset(accumPct: number): number {
  const circum = 2 * Math.PI * 40
  return -((accumPct / 100) * circum)
}

function formatVal(v: number): string {
  return Number(v).toLocaleString('id-ID')
}
</script>
