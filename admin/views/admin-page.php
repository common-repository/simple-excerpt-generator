<?php
if ( ! defined( 'ABSPATH' ) ) exit;
if (current_user_can('edit_others_posts')) {
wp_enqueue_script('seg-admin-script');
// collecting data for presets
  $post_types = get_post_types(array('public'=>true));
  $avalable_categories = json_encode(get_categories());
  $wp_nonce = wp_create_nonce('easy_excerpt_generator_security');
  wp_localize_script('seg-admin-script', 'categories', $avalable_categories);
  wp_localize_script('seg-admin-script', 'seg_security_token', $wp_nonce);
//declare availeble categories in script
?>

<!-- admin page layout -->
<div class="simple-excerpt-gen-container">

  <h1><?php echo esc_html_e('Simple Excerpt Generator Settings')?></h1>

  <div class="seg-form">

    <div class="post-type-settings">
      <label for="post-type-select"><?php echo esc_html_e('Generate excerpts for (post type)')?></label>
      <select id="post-type-select" class="setting">
        <?php
          foreach ($post_types as $key => $value)
                { ?>
                    <option value='<?php echo esc_attr($key) ?>'>
                      <?php echo esc_html($value) ?>
                    </option>
          <?php } ?>
       </select >
  </div>

<div class="existed-settings">
  <label for="leave-existed-posts">
    <?php echo esc_html_e('Do not change existed excerpts')?>
  </label>
  <input id ="leave-existed-posts" type="checkbox" name="leave-existed-posts"  class="setting"/>
</div>

<h3><?php echo esc_html_e('Include categories')?></h3>
  <div class="include-categoty-settings seg-categories"></div>
  <div class="seg-include cat-tree"></div>

<h3><?php echo esc_html_e('Exclude categories')?></h3>
  <div class="exclude-categoty-settings seg-categories"></div>
  <div class="seg-exclude cat-tree"></div>

</div>

<div class="seg-view-setting" >
  <div class="seg-view-item left-column">
    <label for="excerpt-suffix"><?php echo esc_html_e('Excerpt suffix ')?></label>
    <input type="text" id="excerpt-suffix" class="setting" name="" value="" />
    <label><?php echo esc_html_e('allowed (a-z  0-9 space , . > -) ')?></label>
  </div>

  <div class="seg-view-item rigth-column">
    <label for="excerpt-suffix"><?php echo esc_html_e('Number of words in an excerpt*')?></label>
    <input type="text" id="excerpt-words" class="setting" name="" value="" />
</div>

  <div class="generate-button-container">
    <button id="seg-generate" type="button" name="generate"><?php echo esc_html_e('Generate excerpts') ?></button>
  </div>
</div>

<input id="include-categories"  type="hidden" value="" />
<input id="exclude-categories"  type="hidden" value="" />
</div>
<?php
}
else{
      echo esc_html('You have no permition to edit others posts!');
    }
