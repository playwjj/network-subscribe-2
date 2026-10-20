<script setup>
    // Fork addition: ClashParty-style YAML override card.
    // Mirrors DnsOverrideCard.vue structure for consistent styling.
    import { computed, ref } from 'vue';
    import { useI18n } from '@/i18n/index.js';
    import yaml from 'js-yaml';

    const { t } = useI18n();

    const props = defineProps({
        settings: {
            type: Object,
            required: true,
        },
    });

    const inputValue = computed({
        get() {
            return props.settings.clashOverrideYaml || '';
        },
        set(value) {
            props.settings.clashOverrideYaml = value;
        },
    });

    const yamlError = ref('');

    function validateInput() {
        const raw = inputValue.value.trim();
        if (!raw) {
            yamlError.value = '';
            return;
        }
        try {
            const parsed = yaml.load(raw);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                yamlError.value = t('settings.yamlOverrideInvalidObject');
            } else {
                yamlError.value = '';
            }
        } catch {
            yamlError.value = t('settings.yamlOverrideInvalidYaml');
        }
    }

    const hasValue = computed(() => inputValue.value.trim().length > 0);
</script>

<template>
    <div
        class="rounded-xl border border-gray-100/80 bg-white/90 p-6 shadow-xs dark:border-white/10 dark:bg-gray-900/70 space-y-4"
    >
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-violet-600 dark:text-violet-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M11 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2v-5m-3 0l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                </div>
                <div>
                    <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                        {{ t('settings.yamlOverrideTitle') }}
                    </h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ t('settings.yamlOverrideDesc') }}
                    </p>
                </div>
            </div>
            <span
                v-if="hasValue"
                class="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
            >
                {{ t('settings.yamlOverrideActive') }}
            </span>
        </div>

        <div>
            <label
                class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
            >
                {{ t('settings.yamlOverrideLabel') }}
            </label>
            <textarea
                v-model="inputValue"
                rows="20"
                spellcheck="false"
                :placeholder="t('settings.yamlOverridePlaceholder')"
                class="block w-full rounded-lg border bg-white px-4 py-3 font-mono text-xs leading-relaxed text-gray-900 shadow-sm transition-colors duration-200 focus:border-violet-500 focus-visible:ring-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                :class="
                    yamlError
                        ? 'border-red-300 focus:border-red-500 focus-visible:ring-red-500 dark:border-red-500/50'
                        : 'border-gray-200 dark:border-gray-700'
                "
                @blur="validateInput"
            />
            <p v-if="yamlError" class="mt-2 text-xs text-red-600 dark:text-red-400">
                {{ yamlError }}
            </p>
            <p v-else class="mt-2 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                {{ t('settings.yamlOverrideHint') }}
            </p>
        </div>
    </div>
</template>
