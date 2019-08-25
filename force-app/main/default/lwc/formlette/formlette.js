import { LightningElement, api } from 'lwc';

export default class Formlette extends LightningElement {

    @api name
    @api visibilityState
    @api config
    @api trackTouch = false

    constructor() {
        super();
        this.template.addEventListener('change', this.handleValueChange.bind(this));
        this.template.addEventListener('focusout', this.handleTouch.bind(this));
    }

    get visible() {
        const isHidden = !this.visibilityState[this.name]; 
        const hasParent = !!(this.config && this.config.parentName)
        // if the component doesnt have a parent(or a config) it's always visible. otherwise we look at the visibility state to determine whether it should render
        return hasParent ? !isHidden : true; 
    }

    connectedCallback() {
        const { config, name } = this;
        this.registerFormlette({ config, name });
    }

    handleValueChange(event) {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value; // for checkbox inputs, the value is contained in the 'checked' property 
        const name = this.name;
        this.updateStateValues({ [name]: value });
    }

    handleTouch() {
        if (this.trackTouch) {
            this.updateTouched(this.name)
        }
    }

    registerFormlette(payload) {
        this.fireFormChangeEvent({
            type: 'REGISTER_FORMLETTE',
            payload,
        });
    }

    updateStateValues(payload) {
        this.fireFormChangeEvent({
            type: 'UPDATE_VALUE',
            payload,
        })
    }

    updateTouched(payload) {
        this.fireFormChangeEvent({
            type: 'UPDATE_TOUCHED',
            payload,
        })
    }

    fireFormChangeEvent(action) {
        const lwcFormAction = new CustomEvent('formletteaction', { detail: action, bubbles: true });
        this.dispatchEvent(lwcFormAction);
    }
}