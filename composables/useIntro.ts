let intro: Ref<boolean> = ref(true);
let introPlaying: Ref<boolean> = ref(false);
export const useIntro = () => {
    const setIntro = (b: boolean) => {
        intro.value = b;
    };
    const setIntroPlaying = (b: boolean) => {
        introPlaying.value = b;
    }
    return { intro, introPlaying, setIntro, setIntroPlaying };
};
