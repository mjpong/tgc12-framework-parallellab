const express = require('express')
const router = express.Router();
const {
    bootstrapField,
    createPosterForm
} = require('../forms')

// #1 - import in our model
// if we require a directory (aka folder), nodejs will automatically
// refer to the index.js in that directory
const {
    Poster, Category, Tag
} = require('../models');

router.get('/', async (req, res) => {
    // same as: select * from posters
    let posters = await Poster.collection().fetch(
        // {
        //     'withRelated':['category', 'tags']
        // }
    );
    res.render('posters/index', {
        'posters': posters.toJSON()
    })
})

router.get('/create', async (req, res) => {

    // get all the categories from the database
    // const choices = await Category.fetchAll().map((category)=>{
    //     return [ category.get('id'), category.get('name')]
    // });

    const allCateogries = await Category.fetchAll();
    const choices = [];
    for (let category of allCategories) {
        choices.push([ category.get('id'), category.get('name')])
    }

    // load in all the possible tags
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name') ]);
    const posterForm = createPosterForm(choices, allTags);

    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const posterForm = createPosterForm(allCategories);
    posterForm.handle(req, {
        'success': async (form) => {
            // create a new instance of the Poster model
            // the Poster model refers to a table
            // an instance of the Poster model refer to one row
            // when we create a new instance of the product model
            // it means we are creating a new row in the posters table
            // form.data will contain the user's input via the text boxes
            console.log(form.data);
            let {tags, ...posterData} = form.data;
            let poster = new Poster(posterData);
            await poster.save();

            if (tags) {
                // convert comma seperated strings into array
                let selectedTags = tags.split(",");
                // associate product with the tags
                await poster.tags().attach(selectedTags);
            }
            res.redirect('/posters');
        },
        'error': async (form) => {
            // re-render the form if there is an error
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// display the form that displays a product for editing
router.get('/:poster_id/update', async (req, res) => {
    const choices = await Category.fetchAll().map((category)=>{
        return [ category.get('id'), category.get('name')]
    });
   
    // retrieve all the tags
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name') ]);

    // retrieve the product from the database
    const posterId = req.params.poster_id;

    // fetch the product from the database
    // if we are referring to the MODEL directly, we are accessing the entire table
    // if we are referring to one INSTANCE of the model, we are accessing one row
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        'require': true,
        'withRelated': ['category', 'tags']
    })

    const posterForm = createPosterForm(choices, allTags);
    posterForm.fields.name.value = poster.get('name');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.category_id.value = poster.get('category_id');

    // pluck will retrieve one element from each object and put it into an array
    let selectedTags = await poster.related('tags').pluck('id');

    // Alternatively:
    // let selectedTags = await poster.related('tags').fetchAll().map( t => t.id);

    // Alternivately:
    // let tags = await poster.related('tags').fetchAll();
    // let selectedTags = [];
    // for (let t of tags) {
    //     selectedTags.push(t.get('id'));
    // }
    console.log("selectedTags = ", selectedTags);
    posterForm.fields.tags.value = selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
    })

})

router.post('/:product_id/update', async(req,res)=>{

    // retrieve all the tags
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name') ]);

    const choices = await Category.fetchAll().map((category)=>{
        return [ category.get('id'), category.get('name')]
    });
   

    // fetch the product that we want to update
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        'require': true,
        'withRelated': ['category', 'tags']
    }) 

    // process the form
    const posterForm = createPosterForm(choices, allTags);
    posterForm.handle(req, {
        'success': async(form)=>{
            let {tags, ...posterData} = form.data;
            product.set(posterData);
            await poster.save();

            // // update the tags
            // let selectedTags = tags.split(',');
            // console.log("selected tags after submit form =", selectedTags);

            // // 1. get all the tags that already associated with the product
            // let existingTagIds = await product.related('tags').pluck('id');
            // console.log("existing Tag Ids =" , existingTagIds);

            // // 2. selet all the tags that are not selected anymore and put it into the toRemove array
            // let toRemove = existingTagIds.filter( id => selectedTags.includes(id+"") === false)
            // console.log("to remove=", toRemove);
            // // 3. remove the tags that existed in the relationship but has been removed
            // await product.tags().detach(toRemove);

            // // 4. add in all the tags that are selected in the form
            // await product.tags().attach(selectedTags);

            // alternatively:
            // delete all the existing tags
            let existingTagIds = await poster.related('tags').pluck('id');
            poster.tags().detach(existingTagIds);

            // add back the selected tags
            let selectedTags = tags.split(',');
            poster.tags().attach(selectedTags);

            res.redirect('/posters');
        },
        'error': async (form)=>{
            // re-render the form if there are errors
            // to display the error messages
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })
})

router.get('/:poster_id/delete', async(req,res)=>{
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    })

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
})

router.post('/:poster_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    })

    // use the Bookshelf ORM to delete the product
    await poster.destroy();
    res.redirect('/posters')
})


module.exports = router;