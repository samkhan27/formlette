import { LightningElement, api } from 'lwc';

const DEBOUNCE_WAIT = 100;

function ensureArray(thing) {
    return Array.isArray(thing) ? thing : thing !== undefined && thing != null ? [thing] : []; // eslint-disable-line no-undef
}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export default class FormAbstract extends LightningElement {

    @api values = {}
    @api touched = {}
    @api visibilities = {}
    @api configs = {}
    @api formletteGraph = {} 

    constructor() {
        super();
        this.template.addEventListener('formletteaction', this.handleFormChange.bind(this));
    }

    @api
    getVisibleData = () => {
        const { visibilities, values, configs } = this;
        return Object.keys(values).reduce((acc, key) => {
            if (!(configs[key] && !visibilities[key])) {
                return Object.assign(acc, { [key]: values[key] });
            }
            return acc;
        }, {})
    }

    @api
    validateInputs = () => {
        const inputComponents = this.template.querySelectorAll(".formlette-input");
        const inputsArray = inputComponents ? [...inputComponents] : [];
        return inputsArray.reduce((acc, inputCmp) => {
            inputCmp.reportValidity();
            return acc && inputCmp.checkValidity();
        }, true)
    }

    @api
    handleValueChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        // we don't need immediate state updates, so a debounced computation is preferred to improve performance 
        this.debouncedUpdateStateValues({ [name]: value });
    }

    @api
    handleTouched = (event) => {
        const name = event.target.name;
        this.updateStateTouched(name);
    }

    @api
    updateValuesAndVisibilities = (newValues) => {
        this.updateStateValues(newValues)
        this.updateChildrenVisibilities(Object.keys(newValues))
    }

    handleFormChange(event) {
        const { type, payload } = event.detail;
        if (type === 'UPDATE_VALUE') {
            // on state updates dont need immediate computation of visibilities, so a debounced computation is preferred to improve performance
            this.debouncedUpdateValuesAndVisibilities(payload);
        } else if (type === 'REGISTER_FORMLETTE') {
            const { config, name } = payload;
            this.updateState('configs')({ [name]: config })
        } else if (type === 'UPDATE_TOUCHED') {
            this.updateStateTouched(payload)
        }
    }

    renderedCallback() {
        this.formletteGraph = this.generateFormletteGraphFromConfigs() 
    }
    
    generateFormletteGraphFromConfigs() {
        return Object.entries(this.configs).reduce((graph, [name, config]) => {
            const parentName = config && config.parentName
            if (parentName) {
                graph[parentName] = graph[parentName] ? [...graph[parentName], name] : [name]
            }
            return graph
        }, {})
    }

    updateChildrenVisibilities(elemNames = []){
        const visibilities = {...this.visibilities }
        while(elemNames.length > 0) {
            const currentElemName = elemNames.pop()
            // needs the updated visibilities to determine component's visibility based on parent
            const visibility = this.computeFormletteVisibility(currentElemName, visibilities)
            visibilities[currentElemName] = visibility
            if (this.formletteGraph[currentElemName]) {
                elemNames = [...elemNames, ...this.formletteGraph[currentElemName]]
            }
        }
        this.visibilities = visibilities
    }

    computeFormletteVisibility(name, visibilities) {
        let visible = true
        const config = this.configs[name]
        if (config) {
            visible = false;
            const { parentName, showFor, showIfExists } = config;
            const value = this.values[parentName]
            const parentVisible = visibilities[parentName]
            if (parentName) {
                // eslint-disable-next-line no-extra-boolean-cast
                if (!!parentVisible) {
                    if (showIfExists === true) {
                        visible = !!value;
                    } else if (showFor) {
                        const showForValues = ensureArray(showFor)
                        visible = showForValues.includes(value)
                    }
                }
            }
        }
        return visible
    }

    debouncedUpdateStateValues = debounce(values => {
        this.updateStateValues(values)
    }, DEBOUNCE_WAIT)

    debouncedUpdateValuesAndVisibilities = debounce(newValues => {
        this.updateStateValues(newValues)
        this.updateChildrenVisibilities(Object.keys(newValues))
    }, DEBOUNCE_WAIT)

    updateStateValues = newValues => {
        this.updateState('values')(newValues)
    }
    
    updateStateTouched(name) {
        this.updateState('touched')({[name]: true})
    }

    updateState = key => newState => {
        this[key] = { ...this[key], ...newState }
    }
}