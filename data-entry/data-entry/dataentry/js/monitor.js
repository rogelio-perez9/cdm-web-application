(function() {
	'use strict';

	$(':input').each(function() {
		if ($(this).is(':checkbox')) {
	    	$(this).data('initialValue', $(this).is(':checked'));
	    } else if ($(this).is(':radio')) {
	    	$(this).data('initialValue', $(this).is(':checked'));
	    } else {
	    	$(this).data('initialValue', $(this).val());
	    }
	});

	window.onbeforeunload = function(){
	    var msg = 'You haven\'t saved your changes.';
	    var isDirty = false;

	    $(':input').each(function () {
	    	if ($(this).is(':checkbox')) {
	    		if($(this).data('initialValue') !== $(this).is(':checked')){
		            isDirty = true;
		        }
	    	} else if ($(this).is(':radio')) {
	    		if($(this).data('initialValue') !== $(this).is(':checked')){
		            isDirty = true;
		        }
	    	} else {
		        if($(this).data('initialValue') != $(this).val()){
		            isDirty = true;
		        }
		    }
	    });

	    if(isDirty == true){
	        return msg;
	    }
	};
})();	
		