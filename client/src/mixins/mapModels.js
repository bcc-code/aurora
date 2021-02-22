import * as Models from '@/models'

export const mapModels = function(fields) {
    const computeds = {};
    for (const field of fields) {
        computeds[field + 'Labels'] = {
            get() {
                return Models[field + 'Labels']
            }
        }
        computeds[field] = {
            get() {
                return Models[field]
            }
        }
    }
    return computeds;
}