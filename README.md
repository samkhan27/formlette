---

# Formlette
#### A form library for Lightning Web Components(LWC) framework
If you are a Salesforce Developer, chances are you've built plenty of forms. Enterprises love forms, usually large ones, with lots of inputs and logic conditional rendering those inputs. Formlette - pronounced like omelette - is a library for building such forms in Salesforce' Lightning Web Components (LWC) framework.

The requirements in Enterprises usually go something like this, "Collect a whole bunch of data from users but don't bombard them with all the input fields at once; instead, render only the fields that are relevant based on the inputs they have already filled oud." I've built formlette to simplify the process of building such forms in LWC by housing the forms state in one place and by separating out the conditional rendering logic from the mark up by configuring each element in the form to render based on the data housed in the form.

## What does formlette do?
Basically, formlette lets you build forms with behaviour such as this:
with code like this:


```html
<template>
    <lightning-input 
        class="formlette-input"
        type="text" 
        label="Input that has no contidional render logic" 
        name="noConditionalLogic"
        onfocusout={handleTouched}
        onchange={handleValueChange}
        required>
    </lightning-input>
    <c-formlette track-touch visibility-state={visibilities} name="libName" >
        <lightning-input 
            class="formlette-input"
            type="text" 
            label="Say my name"
        >
        </lightning-input>
    </c-formlette>
    <c-formlette track-touch visibility-state={visibilities} config={moreConfig} name="more" >
        <lightning-combobox 
            class="formlette-input" 
            label="Would you like to see more input components?" 
            placeholder="Please select"
            value={values.more} 
            options={yesNoOptions} 
            required>
        </lightning-combobox>
    </c-formlette>
    <c-formlette track-touch visibility-state={visibilities} config={someMoreConfig} name="noop">
        <lightning-input 
            class="formlette-input"
            type="text" 
            label="Here's one that does nothing" 
            value={values.noop}
            >
        </lightning-input>
    </c-formlette>
    <c-formlette track-touch visibility-state={visibilities} config={someMoreConfig} name="someMore">
        <lightning-combobox 
            class="formlette-input" 
            label="How about some more?" 
            placeholder="Please select"
            value={values.someMore} 
            options={someMoreOptions} 
            required>
        </lightning-combobox>
    </c-formlette>
    <c-formlette track-touch visibility-state={visibilities} config={lastConfig} name="last">
        <lightning-input 
            class="formlette-input" 
            label="last one"
            placeholder="last one"
            value={values.last} 
            required>
        </lightning-input>
    </c-formlette>
    <div class="slds-p-vertical_small">
        <lightning-button label="Submit" variant="brand" onclick={handleSubmit}></lightning-button>
    </div>
</template>
```

```js
import formAbstract from 'c/formAbstract'

export default class Example extends formAbstract {
    yesNoOptions = [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' }
    ]

    someMoreOptions = [
        { label: 'Sure', value: 'sure' },
        { label: `Nah, I'm good`, value: 'nah-im-good' }
    ]

    moreConfig = {
        parentName: 'libName',
        showFor: 'formlette',
    }

    someMoreConfig = {
        parentName: 'more',
        showFor: 'yes',
    }

    lastConfig = {
        parentName: 'someMore',
        showFor: 'sure',
    }
    
    handleSubmit() {
        const allValid = this.validateInputs()
        if(allValid) console.log(this.getVisibleData())
        console.log(this.touched)
    }
}
```

## How to use it?
Formlette provides the developer with two LWC components.

### formAbstract
An abstract component that must be extended by the component implementing the form. The formAbstract component provides the sub component (the one that extends it) with a shared from state to house the form data and functions to update, validate and access said form data. formAbstract exposes the following public properties:

*values*: Part of the form state that stores the values of all the child input components in the form keyed by name.

*touched*: State that stores the information about which of the children components in the form were touched by the user (even if they weren't completed - often useful for analytics), keyed by the formlette or input component name.

*visibilities*: State that stores the information about which of the formlettes in the form are visible at any time, keyed by the formlette name.

*getVisibleData()*: Method that returns values of all the visible fields in the form.

*handleValueChange()*: Event handler method that lets a child component to set values in the form on DOM events. Useful for setting values from components that don't have conditional render logic and hence do not need to be wrapped by the formlette component.

*handleTouched()*: Event handler method that lets a child component to set touched state in the form on DOM events. This is called by the formlette component on focusout.

*updateValuesAndVisibilities()*: Method that takes as its parameter, a JS object of input values keyed by their names and updates the values state and updates which components should be visible based on those updated values. This is meant to be used to populate one or more fields in the form based on external inputs (not user inputs).

*validateInputs()*: Runs validation checks on all the visible inputs and returns true of all the visible fields in the form have valid inputs. For this validation method to be used the component needs to be decorated with the class 'formlette-input'. If it is a custom input component, it needs to implement the *reportVailidity()* and *checkValidity()* methods which should work in a manner similar to that specified by Salesforce' base input component, [lightning-input](https://developer.salesforce.com/docs/component-library/bundle/lightning-input/specification).



### formlette
A component that wraps around the input components in the form and provide them with the conditional rendering logic. It exposes the following public properties.

*name*: Component name which will be used as a key in the form's state

*visibilityState*: Takes in the part of state from the parent component that houses the flags that determine whether the formlette should be visible. This property is necessary to determine which formlettes should be visible. It is only passed in explicitly since LWC does not have an analogue to React's context to support implicit passing of props (the fact that the visibilityState needs to be passed in explicitly is quite ugly in my opinion but for now there is no alternative in LWC so think of this as necessary syntax for using the formlette library).

*trackTouch*: Boolean to indicate whether the form state should keep track of whether the input wrapped in the formlette was touched by the user. If set to true the component fires an update on the html 'focusout' event to inform the form state that this formlette was "touched". By default this boolean is false.

*config*: Accepts an optional configuration object that describes the logic for when to render the particular formlette. Currently, the config is a JS object that supports the following properties:

**parentName** - name of the parent formlette whose value decides whether this formlette be displayed.

**showFor** - the value or list of values that the parent can have for this formlette to be visible

**showIfExists** - boolean which if set to true will ensure that the formlette is visible if the parent is populated


Generally, you want to have either 'showFor' or 'showIfExists' populated. If both are populated, the behaviour defined by 'showFor' will take precedence.


## Usage considerations
In large forms as is often required in the enterprise world where salesforce is so prevalent, there could be hundreds of input fields. Usually not all of these inputs require conditional rendering, that is, they are neither rendered based on the value of another input (child), nor are the values they capture responsible for whether another input is rendered (parent).

For efficient performance, only wrap the inputs that are responsible conditional rendering behaviour in the form (parent or child) with the formlette component. The rest of the inputs can still store data in the form state, be it values or touched state using the handleValueChange() and handleTouched() methods in the formAbstract component. The name of the key by which the sate should be stored is defined by the html name attribute. This is demonstrated in the html file in the example code where the first input is merely a lightning-input that is not wrapped in a formlette.
