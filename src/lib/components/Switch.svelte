<script lang="ts">
    import type { Size } from "../types";

    interface Props {
        checked?: boolean;
        id?: string;
        label?: string;
        size?: Size;
        trackSize: Size;
        margin?: Size;
        activeBg?: string;
        bg?: string;
        thumbBg?: string;
    }
    let {
        checked = $bindable(false),
        id = "",
        label = "",
        size = "20px",
        trackSize,
        margin = "5px",
        activeBg = "#22ee22",
        bg = "#ddd",
        thumbBg = "#fff",
    }: Props = $props();
</script>

<label for={id}>
    {label}
</label>
<input
    class="switch"
    style:--size={size}
    style:--track-size={trackSize}
    style:--margin={margin}
    style:--thumb-bg={bg}
    style:--thumb-bg-active={activeBg}
    style:--thumb={thumbBg}
    {id}
    type="checkbox"
    bind:checked
/>

<style>
    .switch {
        appearance: none;
        margin: 0;
        padding: 0;
        border: 0;
        background: var(--thumb-bg);
        display: block;
        width: var(--track-size, calc(var(--size) * 2));
        height: var(--size);
        position: relative;
        border-radius: var(--size);
        transition: background-color 400ms;
    }

    .switch:before {
        content: "";
        position: absolute;
        width: calc(var(--size) - var(--margin));
        height: calc(var(--size) - var(--margin));
        transform: translate(calc(var(--margin) / 2), calc(var(--margin) / 2));
        border-radius: 50%;
        background: var(--thumb);
        transition: transform 400ms;
        border: 1px solid #5555;
        box-sizing: border-box;
    }

    .switch:checked {
        background: var(--thumb-bg-active);
    }

    .switch:checked:before {
        transform: translate(
            calc(
                -100% + var(--track-size, calc(var(--size) * 2)) - var(
                        --margin
                    ) / 2
            ),
            calc(var(--margin) / 2)
        );
    }
</style>
