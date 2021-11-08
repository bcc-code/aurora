<template>
<div class="w-full">
    <input type="text" class="mb-3 form-input" v-model="incoming_value.author" placeholder="Speaker" />
    <div class="flex justify-between w-full pb-4">
            <select class="form-input" v-model="book">
                <option value="-1" disabled="disabled">Book</option>
                <option v-for="(book, index) in bible" :value="index">
                    <template>{{book.book | capitalize}}</template>
                </option>
            </select>

            <select class="form-input" v-model="chapter">
                <option value="-1" disabled="disabled">Chapter</option>
                <option v-if="book < 0 || !bible[book]" disabled="disabled"></option>
                <option v-else v-for="(chapter, index) in bible[book].chapters" :value="index">
                {{ chapter.chapter }}
                </option>
            </select>

            <select class="form-input" v-model="verse_from">
                <option value="-1" disabled="disabled">Verse From</option>
                <option v-if="book < 0 || chapter < 0 | !bible[book].chapters[chapter]" disabled="disabled"></option>
                <option v-else v-for="index in bible[book].chapters[chapter].verses" :value="index">
                    {{ index }}
                </option>
            </select>

            <select class="form-input" v-model="verse_to">
                <option value=""></option>
                <option v-if="book < 0 || chapter < 0 | !bible[book].chapters[chapter]" disabled="disabled" value=""></option>
                <option v-else v-for="index in bible[book].chapters[chapter].verses" :value="index">
                    {{ index }}
                </option>
            </select>
    </div>
    <div v-if="fetching_verse">
        Loading verse text.
    </div>
    <div v-else-if="location" class="flex justify-between w-full pb-4">
        <div>{{ resolvedLocation }}: <div v-html="verseTextHTML"></div>
            <sub>NB-1930</sub>
        </div>
    </div>
</div>
</template>

<script>
import bible from '../../data/bible.json'
import { ContributionTypes } from '@/models/contribution.js'

export default {
    data: () => ({
        bible,
        book: -1,
        chapter: -1,
        verse_from: -1,
        verse_to: -1,
        incoming_value: {},
        verseData: {},
        resolvedLocation: "",
        preview: "Please select a specific verse",
        fetching_verse: false,
    }),
    props: [ "value" ],
    created: function() {
        this.location = this.value;
    },
    computed: {
        ContributionTypes(){
            return ContributionTypes
        },
        verseTextHTML: {
            get: function() {
                if (!this.verseData || !this.verseData.verses) {
                    return ""
                }
                return this.verseData.
                    verses.reduce(
                        (accumulator, currentValue) => accumulator + "<br />\n" + `${currentValue.number} ${currentValue.text}`,
                        "");
            }
        },
        verseTextOutgoing: {
            get: function() {
                if (!this.verseData || !this.verseData.verses) {
                    return ""
                }
                return this.verseData.
                    verses.reduce(
                        (accumulator, currentValue) => accumulator + " " + `${currentValue.number} ${currentValue.text}`,
                    "");
            }
        },
        location: {
            get: async function() {
                return this.resolvedLocation;
            },
            set: function(val) {
                if (!val || !val.verse) {
                    return
                }
                // Internally we use the index
                for (let index in this.bible) {
                    if (this.bible[index].translated.no.abbr == val.verse.book) {
                        this.book = index;
                        break;
                    }
                }
                // Internally we use the index so ch 1 == index 0
                this.chapter = val.verse.chapter - 1
                this.verse_from = val.verse.verse_from
                this.verse_to = val.verse.verse_to
            },
        },
    },

    watch: {
        book: async function() {
            this.verse = "";
            await this.updateVerseData()
            this.$emit('input', this.incoming_value);
        },
        chapter: async function() {
            this.verse = "";
            await this.updateVerseData()
            this.$emit('input', this.incoming_value);
        },
        verse_from: async function() {
            await this.updateVerseData()
            this.$emit('input', this.incoming_value);
        },
        verse_to: async function() {
            await this.updateVerseData()
            this.$emit('input', this.incoming_value);
        },
    },

    methods: {
        updateVerseData: async function() {
                this.preview = "";
                this.resolvedLocation = "";

                // This needed so that the emit pushes out a new object,
                // otherwise the listening component doesn't understand that stuff changed
                // Also ref: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
                this.incoming_value = JSON.parse(JSON.stringify(this.incoming_value));
                this.incoming_value.verse = {};

                this.incoming_value.type = ContributionTypes.BIBLEVERSE;

                if (this.book < 0) {
                    return this.resolvedLocation;
                }

                this.resolvedLocation += this.bible[this.book].translated.no.abbr;
                this.incoming_value.verse.book = this.bible[this.book].translated.no.abbr;
                this.incoming_value.verse.canonical_book = this.bible[this.book].abbr;


                if (this.chapter < 0 || !this.bible[this.book].chapters[this.chapter]) {
                    return this.resolvedLocation;
                }

                this.resolvedLocation += " " + (this.chapter + 1);
                this.incoming_value.verse.chapter = this.chapter + 1;

                if (this.verse_from < 0 || this.bible[this.book].chapters[this.chapter].verses < this.verse_from) {
                    this.verse_from = -1
                    return this.resolvedLocation;
                }

                this.resolvedLocation += ":" + this.verse_from;
                this.incoming_value.verse.verse_from = this.verse_from;

                if (this.verse_to < 0 || this.verse_to <= this.verse_from || this.bible[this.book].chapters[this.chapter].verses < this.verse_to) {
                    this.verse_to = -1
                    await this.getVerseData();
                    this.incoming_value.content = this.verseTextOutgoing;
                    return this.resolvedLocation;
                }

                this.resolvedLocation += "-" + this.verse_to;
                this.incoming_value.verse.verse_to = this.verse_to;
                await this.getVerseData();
                this.incoming_value.content = this.verseTextOutgoing;
                return this.resolvedLocation;
        },

        getVerseData: async function(version = "nb-1930") {
             if (!this.incoming_value || !this.incoming_value.verse) {
                 return "";
             }

             const verse = this.incoming_value.verse;
             if (!verse.verse_from) {
                 return "";
             }

             let verseParam = `${verse.canonical_book}/${verse.chapter}/${verse.verse_from}`

            if (verse.verse_to) {
                verseParam += `/${verse.verse_to}`
            }

            this.verseData = null;
            
            try {
                this.fetching_verse = true;
                const reply = await fetch(`https://bibleapi.bcc.media/v1/${version}/${verseParam}`);
                this.verseData = (await reply.json())
            } catch(e) {
                this.preview = `Unable to fetch verse: ${err}`
            } finally {
                this.fetching_verse = false;
            }
         },
    }
}
</script>
