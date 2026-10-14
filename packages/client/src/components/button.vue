<script setup lang="ts">
import { computed, useAttrs } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'danger' | 'neutral';
  disabled?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  size: 'md',
  tone: 'danger',
  disabled: false,
  type: 'button',
});

const attrs = useAttrs();

const tag = computed(() => (props.href ? 'a' : 'button'));

const baseClass = 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40';

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-2 text-sm';
    case 'lg':
      return 'px-8 py-4 text-lg';
    default:
      return 'px-4 py-2 text-sm';
  }
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return props.tone === 'neutral'
        ? 'border border-cast-mist/30 text-cast-fog hover:border-cast-signal hover:text-cast-signal'
        : 'border border-cast-mist/30 text-cast-fog hover:border-cast-coral hover:text-cast-coral';
    case 'ghost':
      return props.tone === 'neutral'
        ? 'text-cast-mist hover:text-cast-fog'
        : 'text-cast-mist hover:text-cast-coral';
    default:
      return props.size === 'lg'
        ? 'bg-cast-signal font-display font-bold text-cast-ink hover:brightness-110'
        : 'bg-cast-signal font-semibold text-cast-ink hover:brightness-110';
  }
});
</script>

<template>
  <component
    :is="tag"
    v-bind="attrs"
    :href="href"
    :type="href ? undefined : type"
    :disabled="href ? undefined : disabled"
    :class="[baseClass, sizeClass, variantClass]"
  >
    <slot />
  </component>
</template>
