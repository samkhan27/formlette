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