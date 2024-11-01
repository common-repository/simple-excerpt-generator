(function(simpleExcerptGenerator) {

    // The global jQuery object is passed as a parameter
    simpleExcerptGenerator(window.jQuery, window, document);

  }(function($, window, document) {
    // The $ is now locally scoped
    let selectedCategories = [];
   // Listen for the jQuery ready event on the document
   $(function() {
     // The DOM is ready!
        // show category tree when click on category box
        $('.seg-categories').on('click', (event)=>{
          //exclude click on category item inside the box
          if (event.target.id !=='includedCat')
          {
            $('#cat-source').length
              ?
                $('#cat-source').off().remove()
              :
                $(event.target).next().append(categoryTree(categories));

            checkDisabledList();
            //event listener for ckick on category in categiry tree (to add category to selected list)
            $('#cat-source').on("click", "li" , (event)=>{
                addCategoryToList(
                                  event.target,
                                  getCategoryItemHTML(event.target.id,event.target.innerText),
                                  event.target.id,
                                    );

                checkDisabledList();

                checkCategoriesSettings();

              });
          }
      });
          /**
           * Event listener for generate button
           */
        $('#seg-generate').on('click', () => { generateExcerpts(); });
        // close category tree when click outside
        $('body').on('click',function (e) {
          //make sure that categogy tree is in DOM
          if ($("#cat-source").length )
            {
              if (
                    $(e.target).closest("#cat-source").length
                  ||
                    $(e.target).closest('.seg-categories').length )
                  { return; }

                $('#cat-source').off().remove()
              }
        });

        // click event listener on selected category
        $('#includedCat').live('click', (event)=>
            {
              removeCategoryFromList(event.target);
              addRemoveToFromDisabledList($(event.target).attr('catid'));
              checkCategoriesSettings();
            });

       //settings change Event listener
        $('.setting').on('change',()=>{checkCategoriesSettings()});

   });
//_____________________END of DOM ready function__________________________________

   // Helper functions

   /**
    * Set choosen categories to included or excluded categories hidden input.
    * Gets all the children of
    * div.include-categoty-settings
    * and
    * div.exclude-categoty-settings
    * and set childern "catid" values  to
    * input#include-categories
    * and
    * input#exclude-categories
    * @return void
    */
    function checkCategoriesSettings(){
      let included = [];
      let excluded = [];
      if($('#proceed'))
      {
        $('#proceed-btn').off();
        $('#proceed').remove();
      };
      $('.include-categoty-settings #includedCat').each((i,includedCategory)=>{

        included.push($(includedCategory).attr('catid'));

      });
      $('.exclude-categoty-settings #includedCat').each((i,includedCategory)=>{

        excluded.push($(includedCategory).attr('catid'));

      });

      $('#include-categories').val(included);
      $('#exclude-categories').val(excluded);

    }
   //_________________END checkCategoriesSettings_______________________________

   /**
    * add category to list of choosen categories
    * @param {[object]} currentItem - event.target of clicked list item
    * @param {[string html]} catItemToInsert html of category to add to selected list
    * @param {[string]} categoryToAddId Id of clicked category item
    */
   function addCategoryToList(currentItem,catItemToInsert,categoryToAddId)
    {
      if(!$('.seg-categories span[catid='+categoryToAddId+']').length)
        {
          $(currentItem).closest('.cat-tree').prev().append(catItemToInsert);
           addRemoveToFromDisabledList(categoryToAddId);
        }
   }

   /**
    * remove category from list of choosen categories
    * @param  {[object]} cat DOM object to be removed from selected list
    * @return viod
    */
    function removeCategoryFromList(cat){
      $(cat).remove();
      if ($('#cat-source').length)
        {
          $('#cat-source li#'+$(cat).attr('catid')+'')
          .addClass('pointer')
          .removeClass('disabled');
        }
    }

   /**
    * toggle caftegory id to/from  list of selected categories
    * @param {[string]} id - id of category to add/remove from selected categories
    */
     function addRemoveToFromDisabledList(id)
        {
          if (selectedCategories.includes(id))
            {
              const index = selectedCategories.indexOf(id);
              selectedCategories.splice(index,1);

            }else{ selectedCategories.push(id)}
     }

     /**
      * checks the selectedCategories array and add disabled class to categoryTree
      * @return void
      */
     function checkDisabledList(){
       $.each(selectedCategories,(i,id)=>{
				$('li#'+id+'').addClass('disabled').removeClass('pointer');
			});
     }

   /**
    * Generates category Html from goven id and name
    * @param  {[string]} id   [id of category]
    * @param  {[string]} name [name of category]
    * @return {[string]}      HTML of category
    */
		function getCategoryItemHTML(id, name ){
			const html = '<span id="includedCat" catId="'+id+'" class=" pointer" >'+name+'</span>';
			return html;
		}
    /**
     * start the process of generating excerpts with the settings
     * @return void
     */
    function generateExcerpts(){

      const settings = getSettings();
      const validation = validateSettings(settings);

      if (validation.pass)
        {
          const data = {
			                  'action'  : 'seg_count_posts_to_process',
			                  'type'    : settings.type,
                        'existed' : settings.existed,//boolean
                        'included': settings.included,
                        'excluded': settings.excluded,
                        'suffix'  : settings.suffix,
                        'words'   : settings.words,
                        'security': seg_security_token
		                    };
          //check query settings and count results if any
          $.post(ajaxurl, data, function(response) {
                const postsNumber = parseInt(response,10);
            if (postsNumber > 0)
              {
                const existedSettingText = settings.existed ? 'But existed excerpts will not be changed':'';
                const proceedButton = `<div id="proceed">
                                        <label class="proceed-lbl" for="proceed-btn" >
                                          Current settings will affect <strong> ${response} </strong> posts. ${existedSettingText}
                                        </label>
                                        <button type="button" id="proceed-btn" class="seg-proceed">
                                          Proceed
                                        </button>
                                      </div>`;
                //if query returns posts count > 0 show count and proceed button
                if(!$('#proceed').length)
                  {
                    $(".generate-button-container").after(proceedButton);
                  }

                $('button#proceed-btn').on(
                                           'click',
                                           () => {proceedCreateExcerpts(data,postsNumber)}
                                         );
              }else{
                    const messages = [];
                    messages.push('No posts matched your settings: ' + response);
                    showMessages(messages,'warning');
            }
		        });

        }else{
          showMessages(validation.warnings,'danger');
        }
}


    /**
     * build progress bar layout depend on iterations count
     * @param  {[number]} iterationQuantity [number of iterations in progress]
     * @return {[string]}                   [Html of progress Bar]
     */
      function progressBar(iterationQuantity){
        let progressSteps       = '';
        const width             = ((1/(iterationQuantity)) * 100).toFixed(3);
        for (i=0; i< iterationQuantity;i++)
          {
            progressSteps +=`<div id = "step${i+1}" class="progress-step" style="width:${width}%;"></div>`;
          }
        progressBarElement = `<div id="proceed">
                          <div id="progressBar">
                            ${progressSteps}
                          </div>
                       </div>`;
        return progressBarElement;
      }
      /**
       * Proceeds the create excerpt process, generate excerpts by 20 at once by sending ajax requests one by one
       * @param  {[object]} data        [data for ajax requst]
       * @param  {[number]} postsNumber [numbet of posts that will be affected]
       * @return void
       */
      function proceedCreateExcerpts(data,postsNumber)
        {

            const postsPerIteration = 20;
            const iterationQuantity = Math.ceil(postsNumber/postsPerIteration);
            data['action']          = 'seg_generate_excerpts';
            data['perPage']         = postsPerIteration;
            let guid                = 0;

            if($('#proceed'))
              {
                $('#proceed-btn').off();
                $('#proceed').remove();
              }
            //show progress bar
            $(".generate-button-container").after(progressBar(iterationQuantity));
            /**
             * Helper function to make ajax requests and update progress bar
             * @param  {[object]} data for ajax request
             * @return {[viod]}
             */
            function runAjaxRequest(data)
              {
                data['offset'] = guid  * postsPerIteration;
                guid++;
                const id = guid;

                return new Promise(resolve =>
                  {
                    $.post(ajaxurl, data, function(respons)
                        {
                          $(`#step${id}`).addClass('stepReady');
                          resolve(respons);
                        });
                  });
              }

            const promise = Array.from({ length: iterationQuantity   })
                            .reduce(
                              function (acc)
                                {
                                  return acc.then(
                                    function (changed)
                                      {
                                        return runAjaxRequest(data).then(function(response){
                                          changed.push(parseInt(response,10));
                                          return changed;
                                        })
                                      });
                                }, Promise.resolve([]));

            promise.then((changed)=>{

              const excerptsCreated = changed.reduce((a, b) => a + b, 0);
              const messages = [ excerptsCreated +' Excerpts have been successfully generated!']

              showMessages(messages,'success');
            }
            ).catch(error=>{console.log(error)});

      }
//_________________END proceedCreateExcerpts___________________________________

      /**
       * Inserts block of messages
       * @param  {[array]} messages [array of massages to show]
       * @param  {[string]} status   [css class to add to message box (danger,warning,success)]
       * @return void
       */
      function showMessages(messages,status){
        let messages_html = `<div id="proceed" class="${status}" ><ul class="messages">`;
        $(messages).each((i,message)=>{
          messages_html += `<li class="single-message"> ${message}</li>`;
        });
        messages_html += '</ul></div>';
        if(!$('#proceed').length)
            {
              $(".generate-button-container").after(messages_html);
            }else{
                  $('#proceed').remove();
                  $(".generate-button-container").after(messages_html);
                }
      }
    /**
     * Collect all the user settings
     * @return {[object]} [each setting as a property]
     */
    function getSettings(){
      let settings ={};
      settings['type']     = $('#post-type-select').val();
      settings['existed']  = $('#leave-existed-posts').is(':checked');
      settings['included'] = $('#include-categories').val() !=='' ? $('#include-categories').val() : null;
      settings['excluded'] = $('#exclude-categories').val() !=='' ? $('#exclude-categories').val() : null;
      settings['suffix']   = $('#excerpt-suffix').val()!=='' ? $('#excerpt-suffix').val() : null;
      settings['words']    = $('#excerpt-words').val();
      return settings;
    }

    /**
     * validate the settings according to the rules
     * @param  {[object]} settings [colected settings from user input]
     * @return {[object]}          [contains two properties: pass(boolean), warnings(array)]
     */
      function validateSettings(settings){
        let approved = [];
        let warnings  = [];
        suffixPattern = /^[a-zA-Z0-9,\s>.-]*$/;
        catpattern = /^[a-zA-Z0-9,]*$/;
        wordsPattern = /^[0-9]*$/;

        approved.push(suffixPattern.test(settings.type));

        approved.push(typeof settings.existed === 'boolean');

        if( settings.included !== null && !catpattern.test(settings.included))
            {
              approved.push(false);
              warnings.push('Incorrect value of included categories');
            }

        if( settings.excluded !== null && !catpattern.test(settings.excluded))
            {
              approved.push(false);
              warnings.push('Incorrect value of excluded categories');
            }

        if( settings.suffix   !== null && !suffixPattern.test(settings.suffix) )
            {
              approved.push(false);
              warnings.push('Forbidden characters detected in suffix');
            }

        if( settings.words === '' || !wordsPattern.test(settings.words) || parseInt(settings.words,10) < 1  )
            {
              approved.push(false);
              warnings.push('Number of words is required, and should contain only simple number > 1');
            }

        const pass = !approved.includes(false);

        return prsponse = {pass, warnings};
      }

   /**
    * Create category tree from existing categories
    * @param  {[string]} categories [json of all categories]
    * @return {[string]}            [Html of the category Tree]
    */
		function categoryTree(categories)
      {
			     const catlist = $.parseJSON(categories);

			     if(catlist !== undefined)
            {
				      const parentCategoriesArray = {};
				      const childCategoriesArray 	= [];
				      let currCat={};
              //devide categories in two arrays, top level and children
				      $.each(catlist, (index,cat)=>
                {
						      currCat[cat.cat_ID] = cat.cat_name;

					        if (cat.category_parent === 0)
					           {
						           parentCategoriesArray[cat.cat_ID] = cat.cat_name;
					           }else{
								           if(childCategoriesArray[cat.category_parent] === undefined)
									           {
										           childCategoriesArray[cat.category_parent]=[];
									           }

									         childCategoriesArray[cat.category_parent].push(currCat);
					                }
					         currCat={};
				        });
        //Prepare Html category tree
				let categoryHierarchyList = '<div id="cat-source"><ul>';

				$.each(parentCategoriesArray, (id,name)=>{
					categoryHierarchyList +='<li id="' + id + '" class="cat-item pointer"  >'
					+ name
					+ '</li>'
					+ checkChildren(id,childCategoriesArray,' ')
					+ '' ;
				});
				categoryHierarchyList += '</ul></div>';
				return categoryHierarchyList;
			}
			return '';
		}

    /**
     * check if category has children and return children (html)
     * @param  {[string]} id                   [id of category to check]
     * @param  {[array]} childCategoriesArray [array mapped categories to its parents]
     * @param  {[string]} depth                [string characters for visual separation of child elements]
     * @return {[string]}                      [Html of child category tree]
     */
    function checkChildren(id,childCategoriesArray,depth){

      if(childCategoriesArray[id] !== undefined)
        {
          depth+=' - ';
          let html='';
          $.each(childCategoriesArray[id], (i, child)=>{

            html+='<li id="'+Object.keys(child)[0]
            +
            '" class="cat-item pointer" >'
            +
            depth
            +
            child[Object.keys(child)[0]]
            + '</li>'
            +
            checkChildren(Object.keys(child)[0],childCategoriesArray,depth)
            + '';
          });
          return html;
        }
      return '';
    }
  }
  ));
