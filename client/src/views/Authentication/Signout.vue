<template>
    <Spinner center />
</template>

<script>
import loadjs from "loadjs";

export default {
    async created() {
        loadjs("https://widgets.bcc.no/widgets/signoutjs", {
            async: false,
            error: function (path) {
                console.error('could not load resource: ' + path);
                localStorage.clear();
            },
            success: function() { 
                localStorage.clear();
            },
        });
    },
};
</script>
