/*
 * jQuery iTouch plugin 0.1b
 *
 * Plugin to handle various movements on the iPad, iPhone and iTouch devices, as well as other touchable stuff
 *
 * Copyright (c) 2010 Jason Norwood-Young jason@10layer.com
 *
 */
 
(function($) {
	
	//Global objects
	function oPos() {
		this.posx;
		this.posy;
	}
	
	//Global methods
	getpos=function(e) {
		var pos=new oPos();
		if (e.originalEvent.touches) {
		    var touches=e.originalEvent.touches;
		    if (touches.length == 1) {
		    	var touch=touches[0];
		        pos.x=touch.clientX;
		        pos.y=touch.clientY;
		    }
		} else {
		    pos.x=e.clientX;
		    pos.y=e.clientY;
		}
		return pos;
	}
	
	//Public methods
	var methods= {
		getorientation: function() {
			return $(document).data("orientation");
		}
	};
	
		
	$.fn.itouch = function(options) {
		//Method calling logic
		if ( methods[options] ) {
      		return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
    	}
		
		//Default config
		var config = {
        	trackx: true,
	    	tracky: true,
	    	debug: false,
	    	dragx: {
				enabled: false,
	    		constrain: true,
	    		animate: true,
	    		min_animation_speed: 0.1
	    	},
	    	dragy: {
	    		enabled: false,
	    		constrain: true,
	    		animate: true,
	    		min_animation_speed: 0.1
	    	},
	    	swipe: {
	    		enabled: false,
	    		swipeleft: false,
	    		swiperight: false,
	    		swipeup: false,
	    		swipedown: false,
	    		min: 20
	    	},
	    	orientation: {
	    		enabled: false,
	    		change: false,
	    		horizontal: false,
	    		vertical: false
	    	},
	    	scale: {
	    		enabled: false,
	    		after: false
	    	},
	    	click: false,
	    	timerinterval: 10
	    };
	    	
		debug=function(msg) {
			if (window.console && window.console.log && config.debug) {
				window.console.log(msg);
			} else {
				//$("#info").html(msg);
			}
		};
		
		//Properties
		var startx;
		var starty;
		var currentx;
		var currenty;
		var lastx;
		var lasty;
		var dx;
		var dy;
		this.originaltop;
		this.originalleft;
		//this.scale;
		var parent;
		var ismove=false;
		var isdown=false;
		var timer;
		var timercount=0;
		
		return this.each(function() {
			
			
			//Config	
			if (options) $.extend(true, config, options);
			debug(config);
			debug("iTouch started for "+$(this).attr("id"));
			parent=$(this).parent();
			//this.scale=1;
			
			//Methods
			
			
			
			this.dragx=function() {
				var newleft=(this.originalleft+dx);
				if (this.check_x_constraint(newleft)) {
    				$(this).css("left",newleft+"px");
				}
			}
			
			this.dragy=function() {
				var newtop=(this.originaltop+dy);
				if (this.check_y_constraint(newtop)) {
    				$(this).css("top",newtop+"px");
				}
			}
			
			this.checkSpeed=function() {
				timercount=timercount+config.timerinterval;
				tmpx=(currentx-lastx)/timercount;
				tmpy=(currenty-lasty)/timercount;
				if (tmpx!=0) {
					speexx=tmpx;
				}
				if (tmpy!=0) {
					speedy=tmpy;
				}
				lastx=currentx;
				lasty=currenty;
			}
			
			this.enddragx=function() {
				if (config.dragx.animate) {
					var speed=speedx;
					var newleft=parseInt($(this).css("left"))+(dx*2);
					//debug("Speed: "+speed+" dx: "+dx);
					if (Math.abs(speedx)>config.dragx.min_animation_speed) {
						if (!this.check_x_constraint(newleft)) {
							if (dx>0) {
								newleft=0;
							} else {
								var parentwidth=parseInt(parent.width());
								var elwidth=parseInt($(this).width());
								newleft=(elwidth-parentleft)*-1;
							}
						} 
						$(this).animate({"top": newleft+"px"},{ duration: 1/(Math.abs(speedx)*config.timerinterval)*2000, specialEasing: { left: 'linear', height: 'easeOutBounce'}});
					}
				}
			}
			
			this.check_x_constraint=function(posx) {
				var result=true;
				if (config.dragy.constrain) {
					var parentwidth=parseInt(parent.width());
					var elwidth=parseInt($(this).width());
					if (posx>0) {
						result=false;
					}
					if (Math.abs(posx)>(elwidth-parentwidth)) {
						result=false;
					}
				}
				return result;
			}
		
			
			this.enddragy=function() {
				if (config.dragy.animate) {
					var speed=speedy;
					var newtop=parseInt($(this).css("top"))+(dy*2);
					//debug("Speed: "+speedy+" dy: "+dy);
					if (Math.abs(speedy)>config.dragy.min_animation_speed) {
						if (!this.check_y_constraint(newtop)) {
							if (dy>0) {
								newtop=0;
							} else {
								var parentheight=parseInt(parent.height());
								var elheight=parseInt($(this).height());
								newtop=(elheight-parentheight)*-1;
							}
						} 
						$(this).animate({"top": newtop+"px"},{ duration: 1/(Math.abs(speedy)*config.timerinterval)*2000, specialEasing: { top: 'linear', height: 'easeOutBounce'}});
					}
				}
			}
			
			this.check_y_constraint=function(posy) {
				var result=true;
				if (config.dragy.constrain) {
					var parentheight=parseInt(parent.height());
					var elheight=parseInt($(this).height());
					if (posy>0) {
						result=false;
					}
					if (Math.abs(posy)>(elheight-parentheight)) {
						result=false;
					}
				}
				return result;
			}
			
			this.catchswipe=function() {
				debug("Checking swipe: "+dx);
				if (config.swipe.min<=Math.abs(dx)) {
					debug("Horizontal swipe");
					if ((dx<0) && (config.swipe.swipeleft)) {
						debug("Left swipe");
						config.swipe.swipeleft();
					} else if ((dx>0) && (config.swipe.swiperight)) {
						debug("Right swipe");
						config.swipe.swiperight();
					}
				}
				if (config.swipe.min>=Math.abs(dy)) {
					if ((dy>0) && (config.swipe.swipeup)) {
						config.swipe.swipeup();
					} else if ((dy<0) && (config.swipe.swipedown)) {
						config.swipe.swipedown();
					}
				}
			}
					
			//Events
			$(this).bind("touchstart mousedown", function(e) {
				e.preventDefault();
				//This should stop for drags but not stop for swipes
				//$(this).stop();
				pos = getpos(e);
				startx=pos.x;
				starty=pos.y;
				lastx=pos.x;
				lasty=pos.y;
				//Start timer
				timercount=0;
				timer=setInterval(this.checkSpeed,config.timerinterval);
				ismove=false;
				isdown=true;
				dx=0;
				dy=0;
				speedx=0;
				speedy=0;
				this.originaltop=parseInt($(this).css("top"));
				this.originalleft=parseInt($(this).css("left"));
				//debug("Touched! posx: "+startx+" posy: "+starty+" originaltop: "+this.originaltop);
				
				$(this).bind("touchmove mousemove", function(e) {
					e.preventDefault();
					
					if (isdown) {
						pos=getpos(e);
						dx=pos.x-startx;
						dy=pos.y-starty;
						currentx=pos.x;
						currenty=pos.y;
				    	ismove=true;
				    	if (config.dragy.enabled) {
				    		this.dragy();
				    	}
				    	if (config.dragx.enabled) {
				    		this.dragx();
				    	}
				    }
				}); // $(this).bind("touchmove mousemove", function(e) {
				
				$(this).bind("touchend mouseup", function(e) {
					e.preventDefault();
					pos=getpos(e);
					clearInterval(timer);
					//debug("Finished moving! posx: "+pos.x+" posy: "+pos.y+" speedx: "+speedx+" speedy: "+speedy+" time: "+timercount);
					if (!ismove) {
						debug("Click");
						if (config.click) {
							config.click(e);
						}
						//Bubbles up an event called isclick to use instead of click to avoid clicking when you want to drag
						$(e.target).trigger("isclick");
						
					}
					$(this).unbind('touchmove touchend mousemove mouseup');
					isdown=false;
					
					if (config.dragy.enabled) {
				    	this.enddragy();
				    }
				    if (config.dragx.enabled) {
				    	this.enddragx();
				    }
				    
				    if (config.swipe.enabled) {
				    	this.catchswipe();
				    }
				    
				}); // $(this).bind("touchend mouseup", function(e) {
			}); // $(this).bind("touchstart mousedown", function(e) {
			
			$(window).bind("ochange",function() {
				if (config.orientation.enabled) {
					if ($(document).data("orientation")==0) {
						$(document).data({"orientation":window.orientation});
					}
					if (config.orientation.change) {
						config.orientation.change();
						//$("#info").html(orientation);
					}
					if (config.orientation.horizontal && Math.abs($(document).data("orientation"))==90) {
						config.orientation.horizontal();
					}
					if (config.orientation.vertical && ($(document).data("orientation")==180 | $(document).data("orientation")==0)) {
						config.orientation.vertical();
					}
				}
			});
			
			if (config.scale.enabled) {
					$(this).bind("gesturestart",function(e) {
						//$("#info").html("Gesture started for "+$(this).attr("id"));
						e.preventDefault();
						this.ismove=false;
						$(".scalable").each(function() {
							$(this).data({"startWidth":$(this).width()});
						});
						//$(this).data("startWidth",$(this).width());
						
						e.currentTarget.ongesturechange=function(e) {
							e.preventDefault();
							//var s=$("#info").html()+"<br />---<br />";
							//s+="Gesture changed for "+this.id+"<br />";
							
							/*$(this).siblings(".scalable").each(function() {
								$(this).css("width",$(this).data("startWidth")*e.scale+"px");
								s+=$(this).attr("id")+":"+$(this).data("startWidth")+" * "+e.scale+"<br />";
							});*/
							$(e.currentTarget).find(".scalable").each(function() {
								$(this).css("width",$(this).data("startWidth")*e.scale+"px");
							//	s+=$(this).attr("id")+":"+$(this).data("startWidth")+" * "+e.scale+"<br />";
							});
							/*$(this).parents(".scalable").each(function() {
								$(this).css("width",$(this).data("startWidth")*e.scale+"px");
								s+=$(this).attr("id")+":"+$(this).data("startWidth")+" * "+e.scale+"<br />";
							});*/
							$(e.currentTarget).css("width",$(this).data("startWidth")*e.scale+"px");
							//s+=$(this).attr("id")+":"+$(this).data("startWidth")+" * "+e.scale+"<br />";
							this.ismove=true;
							//$("#info").html(s);
						};
						
						e.currentTarget.ongestureend=function(e) {
							e.preventDefault();
							//$("#info").html("Gesture ended for "+e.currentTarget.id);
							$(e.currentTarget).unbind("ongesturechange gesturechange");
							if (!this.ismove) {
								//$("#info").html("Click");
								//Bubbles up an event called isclick to use instead of click to avoid clicking when you want to drag
								$(this).trigger("click");
							};
							
							config.scale.after();
							
						};
					});
				
				
			}
			
		});
	}

})(jQuery);

//Bit of a hack to get orientation working
$(window).load(function() {
	window.onorientationchange=function() {
		$(this).trigger("ochange");
	}
	window.console.log($(document).ready);
	//More hacking just for PhoneGap
	$(document).bind("deviceready", function() {
		
		//
		//$(document).trigger("ready");
		document.addEventListener('orientationChanged', function(e){
				//alert(e.orientation);
				$(document).data({"orientation": e.orientation});
				
				$(window).trigger("ochange");
				
			},false
		); 
	});
});

/*$(window).load(function() {
	window.console.log(PhoneGap);
	if (PhoneGap.available) {
		alert("I should hijack document.ready");
	}
});*/

