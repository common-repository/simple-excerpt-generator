<?php
/*
Plugin Name: Simple Excerpt Generator
Plugin URI: https://github.com/Serhii-Kozik/simple-excerpt-generator
Description:  Plugin generates excerpts for the existing posts based on post content and plugin presets.
Version:      1.0
Author:       Serhii Kozik
Author URI:
License:      GPL3
License URI:  https://www.gnu.org/licenses/gpl-3.0.html
Text Domain:  simple_excerpt_gen
Domain Path:  /languages
*/
//Sequrity check
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

//enqueue styles and scripts
function seg_admin_enqueue()
  {
    wp_enqueue_style( 'seg-admin-page', plugins_url('admin/css/seg_admin.css', __FILE__));

    wp_register_script('seg-admin-script',plugins_url( 'admin/js/seg_admin.js', __FILE__ ) ,array('jquery'));
  }
add_action('admin_enqueue_scripts', 'seg_admin_enqueue');
function simple_excerpt_generator_admin_page()
{
    add_menu_page(
        'Simple Excerpt Generator',
        'Simple Excerpt',
        'manage_options',
        plugin_dir_path(__FILE__) . 'admin/views/admin-page.php',
        null,
        'dashicons-format-quote',
        20
    );
}
add_action('admin_menu', 'simple_excerpt_generator_admin_page');

//manage ajax request

add_action( 'wp_ajax_seg_generate_excerpts', 'seg_generate_excerpts_handler' );

  function seg_generate_excerpts_handler()
    {
      check_ajax_referer( 'easy_excerpt_generator_security', 'security' );
      $changed = 0;
      $suffix = esc_attr($_POST['suffix']);
      $excerptLength = esc_attr($_POST['words']);

      $args = array(
                      'post_type'        => esc_attr($_POST['type']),
                      'category__not_in' => explode(',', esc_attr($_POST['excluded'])),
                      'posts_per_page'   => esc_attr($_POST['perPage']),
                      'offset'           => esc_attr($_POST['offset'])
                    );
      if ($_POST['included'] !=='')
        {
            $args['category__in'] = explode(',', esc_attr($_POST['included']));
        }

	    $posts_query = new WP_Query( $args );

      foreach ($posts_query->posts as $post)
          {
            if ($_POST['existed'] === 'true' && has_excerpt( $post->ID ))
              {

              }else{
                    $excerpt = wp_trim_words( strip_shortcodes($post->post_content ), intval($excerptLength,10), $suffix );

                    $postToUpdate = array(
                                          'ID'           => $post->ID,
                                          'post_excerpt' => $excerpt,
                                        );
                    // Update the post into the database
                    wp_update_post( $postToUpdate );
                    $changed = $changed + 1;
                  }
          }

          echo json_encode($changed);
	    wp_die(); // this is required to terminate immediately and return a proper response
      die();
  }

//count number of postst to process accorfing the Settings
add_action( 'wp_ajax_seg_count_posts_to_process', 'seg_count_posts_to_process_handler' );

function seg_count_posts_to_process_handler()
  {
    check_ajax_referer( 'easy_excerpt_generator_security', 'security' );
      $args = array(
                      'post_type'        => esc_attr($_POST['type']),
                      'category__not_in' => explode(',', esc_attr($_POST['excluded'])),
                      'posts_per_page'   => -1
                    );
      if ($_POST['included'] !=='')
        {
            $args['category__in'] = explode(',', esc_attr($_POST['included']));
        }

      $total_posts = new WP_Query( $args );

      echo $total_posts->found_posts;

      wp_die(); // this is required to terminate immediately and return a proper response
 }

?>
