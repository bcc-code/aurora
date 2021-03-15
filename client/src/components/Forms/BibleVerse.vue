<template>
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
                <option v-if="book < 0 || chapter < 0 | !bible[book].chapters[chapter]" disabled="disabled"></option>
                <option v-else v-for="index in bible[book].chapters[chapter].verses" :value="index">
                    {{ index }}
                </option>
            </select>
</div>
</template>
<script>
import bible from '../../data/bible.json'

export default {
    data: () => ({
        bible,
        book: -1,
        chapter: -1,
        verse_from: -1,
        verse_to: -1,
    }),
    props: [ "value" ],
    created: function() {
        this.location = this.value;
    },
    computed: {
        location: {
            get: function() {
                let out = ""
                let verse = {}

                if (this.book < 0) {
                    this.$emit('input', {
                            "text": out,
                            "verse": verse,
                            });
                    return out;
                }

                out += this.bible[this.book].translated.no.abbr;
                verse.book = this.bible[this.book].abbr;


                if (this.chapter < 0 || !this.bible[this.book].chapters[this.chapter]) {
                    this.$emit('input', {
                            "text": out,
                            "verse": verse,
                            });
                    return out;
                }

                out += "/" + (this.chapter + 1);
                verse.chapter = this.chapter + 1;

                if (this.verse_from < 0) {
                    this.$emit('input', {
                            "text": out,
                            "verse": verse,
                            });
                    return out;
                }

                out += " " + this.verse_from;
                verse.verse_from = this.verse_from;

                if (this.verse_to < 0 || this.verse_to <= this.verse_from) {
                    this.$emit('input', {
                            "text": out,
                            "verse": verse,
                            });
                    return out;
                }

                out += "-" + this.verse_to;
                verse.verse_to = this.verse_to;

                this.$emit('input', {
                        "text": out,
                        "verse": verse,
                        });
                return out
            },
            set: function(val) {
                // Internally we use the index
                for (let index in this.bible) {
                    if (this.bible[index].abbr == val.verse.book) {
                        this.book = index;
                        break;
                    }
                }

                // Internally we use the index so ch 1 == index 0
                this.chapter = val.verse.chapter - 1
                this.verse_from = val.verse.verse_from
                this.verse_to = val.verse.verse_from
            },
        },
    },
    watch: {
        book: function() { this.verse = ""; this.location; },
        chapter: function() { this.verse = ""; this.location; },
        verse_from: function() { this.location; },
        verse_to: function() { this.location; },
    }
}
</script>