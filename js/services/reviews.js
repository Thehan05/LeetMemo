import {
    getStoredValues,
    setStoredValues
} from "./storage.js";
import { toLocalDateString } from "../utils/format.js";

const INTERVALS = [1, 3, 7, 14, 30, 60, 120];

export async function scheduleNewReview(slug, title) {
    const { reviews = {} } = await getStoredValues("reviews");
    if (reviews[slug]) return;

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = toLocalDateString(date);

    reviews[slug] = { stage: 0, nextReview: dueDate , title};
    await setStoredValues({ reviews });
}


export async function recordPass(slug) {
    const { reviews = {} } = await getStoredValues("reviews");
    const current = reviews[slug];

    if(!current) return;
    const newStage = Math.min(current.stage + 1, INTERVALS.length - 1);
    const date = new Date();
    date.setDate(date.getDate() + INTERVALS[newStage]);
    const nextReview = toLocalDateString(date);

    reviews[slug] = { ...current, stage: newStage, nextReview };
    await setStoredValues({ reviews });
}

export async function recordFail(slug) {
    const { reviews = {} } = await getStoredValues("reviews");
    const current = reviews[slug];

    if(!current) return;
    const newStage = 0;
    const date = new Date();
    date.setDate(date.getDate() + INTERVALS[newStage]);
    const nextReview = toLocalDateString(date);

    reviews[slug] = { ...current, stage: newStage, nextReview };
    await setStoredValues({ reviews });
}

export async function getDueReviews() {
    const { reviews = {} } = await getStoredValues("reviews");
    const today = toLocalDateString(new Date());
   
    const dueReviews = [];
    for(const [slug, review] of Object.entries(reviews)) {
        if(review.nextReview <= today) {
            dueReviews.push({ slug, ...review });
        } 
    }
    return dueReviews;
}